import pdfplumber
import fitz  # PyMuPDF
import os
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import TransformersNlpEngine, NerModelConfiguration
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

pdf_name = 'resume'

# 1. CONFIGURE TRANSFORMER ENGINE
# Entity mapping for the resume model
model_to_presidio_mapping = {
    "Name": "PERSON",
    "PER": "PERSON",
    "PERSON": "PERSON",
    "Email": "EMAIL_ADDRESS",
    "Phone": "PHONE_NUMBER",
    "Degree": "DEGREE",
}

# Create configuration 
ner_model_config = NerModelConfiguration(
    model_to_presidio_entity_mapping=model_to_presidio_mapping,
    low_confidence_score_multiplier=0.4,
    labels_to_ignore=["O"],
    aggregation_strategy="max",
    alignment_mode="expand"
)

# Set spacy and entity identification models.
nlp_engine = TransformersNlpEngine(
    models=[{
        "lang_code": "en", 
        "model_name": {
            "spacy": "en_core_web_sm", 
            "transformers": "Davlan/xlm-roberta-large-ner-hrl"
        }
    }]
)

# Inject the config into the engine
nlp_engine.ner_model_configuration = ner_model_config
def process_model(path):
    import subprocess
    try:
        result = subprocess.run(
            ['node', 'analyze.js', path],
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        return result.returncode
    except Exception as e:
        print(f"Error running analyze.js: {e}")
        return -1
process_model(pdf_name+".pdf")
nlp_engine.load()


# 2. DEFINE CUSTOM RECOGNIZERS
registry = RecognizerRegistry()
registry.load_predefined_recognizers(nlp_engine=nlp_engine)

# A. coding handles
coding_pattern = Pattern(
    name="coding_handle_pattern",
    regex=r"(?:leetcode\.com|codeforces\.com|codechef\.com|github\.com)\/([a-zA-Z0-9_\-\.]+)",
    score=0.95
)
registry.add_recognizer(PatternRecognizer(supported_entity="CODING_HANDLE", patterns=[coding_pattern]))

# B. Phone numbers
indian_phone_pattern = Pattern(
    name="indian_phone",
    regex=r"(?:\+91|0)?\s?[6-9](?:[\s-]?\d){9}\b",
    score=0.9
)
registry.add_recognizer(PatternRecognizer(supported_entity="PHONE_NUMBER", patterns=[indian_phone_pattern]))

# Initialize analyzer & anonymizer
analyzer = AnalyzerEngine(nlp_engine=nlp_engine, registry=registry)
anonymizer = AnonymizerEngine()

print("REACHING HERE")

# 3. PROCESSING
def process_resume(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
    
    # Lower threshold to 0.3 to catch potential Indian names that arent 100% matches
    analysis_results = analyzer.analyze(
        text=text, 
        language="en", 
        entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CODING_HANDLE"],
        score_threshold=0.3
    )

    anonymized = anonymizer.anonymize(
        text=text,
        analyzer_results=analysis_results,
        operators={
            "PERSON": OperatorConfig("replace", {"new_value": "[NAME]"}),
            "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "[PHONE]"}),
            "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "[EMAIL]"}),
            "CODING_HANDLE": OperatorConfig("replace", {"new_value": "[HANDLE]"}),
        }
    )
    return anonymized.text, text, analysis_results

def redact_pdf_with_boxes(pdf_path, analysis_results, original_text, output_path):
    """
    Redact PII in PDF by covering detected text with black boxes.
    """
    # Extract all strings to redact from analysis results
    strings_to_redact = []
    for result in analysis_results:
        text_to_redact = original_text[result.start:result.end]
        if text_to_redact and text_to_redact.strip():
            strings_to_redact.append(text_to_redact)
    
    # Open the PDF with PyMuPDF
    doc = fitz.open(pdf_path)
    
    for page in doc:
        for text in strings_to_redact:
            if not text or len(text.strip()) == 0:
                continue
            
            # Search for all instances of the string on the page
            text_instances = page.search_for(text)
            
            for inst in text_instances:
                # Add a redaction annotation with black fill
                page.add_redact_annot(inst, fill=(0, 0, 0))
        
        # Apply the redactions to the current page
        page.apply_redactions()
    
    # Save the redacted PDF
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    print(f"[SUCCESS] PDF redaction complete. Saved to: {output_path}")

if __name__ == "__main__":
    pdf_input_path = f"data/{pdf_name}.pdf"
    result, original_text, analysis_results = process_resume(pdf_input_path)
    
    # Create output directory if it doesn't exist
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Create op directory for redacted PDFs
    op_dir = "op"
    os.makedirs(op_dir, exist_ok=True)
    
    # Write text result to file
    output_file = os.path.join(output_dir, f"parsed_{pdf_name}.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(result)
    
    print(f"[SUCCESS] Parsed resume saved to {output_file}\n")
    
    # Redact PDF with black boxes
    redacted_pdf_path = os.path.join(op_dir, f"redacted_{pdf_name}.pdf")
    redact_pdf_with_boxes(pdf_input_path, analysis_results, original_text, redacted_pdf_path)
    
    # Display raw Hugging Face model output
    print("=" * 80)
    print("HUGGING FACE MODEL RAW OUTPUT")
    print("=" * 80)
    print(f"NER Model: Davlan/xlm-roberta-large-ner-hrl (via TransformersNlpEngine)")
    print(f"Tokenization: en_core_web_sm (spaCy)")
    print(f"Note: Entity labels come from the Transformers model, wrapped in spaCy objects\n")
    
    # Display redacted entities
    print("=" * 80)
    print("REDACTED ENTITIES")
    print("=" * 80)
    
    if analysis_results:
        # Group by entity type
        entities_by_type = {}
        for res in analysis_results:
            entity_type = res.entity_type
            if entity_type not in entities_by_type:
                entities_by_type[entity_type] = []
            entities_by_type[entity_type].append(res)
        
        for entity_type, entities in sorted(entities_by_type.items()):
            print(f"\n{entity_type}:")
            print("-" * 80)
            for entity in sorted(entities, key=lambda x: x.score, reverse=True):
                redacted_text = original_text[entity.start:entity.end]
                print(f"  • Text: '{redacted_text}'")
                print(f"    Category: {entity_type}")
                print(f"    Confidence Score: {entity.score:.2f}")
                print(f"    Position: characters {entity.start}-{entity.end}")
                print(f"    Recognizer: {entity.recognition_metadata.get('recognizer_name', 'N/A')}")
                print()
    else:
        print("No entities were redacted.\n")
    
    # Get all detected entities (including low confidence ones)
    print("=" * 80)
    print("LOW CONFIDENCE DETECTIONS (Not Redacted)")
    print("=" * 80)
    
    # Analyze again with very low threshold to catch everything
    all_analysis_results = analyzer.analyze(
        text=original_text,
        language="en",
        entities=["PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "CODING_HANDLE", "ORGANIZATION", "LOCATION"],
        score_threshold=0.01  # Very low threshold to catch everything
    )
    
    # Filter for low confidence ones that weren't redacted (below 0.3 threshold)
    low_confidence = [r for r in all_analysis_results if r.score < 0.3]
    
    if low_confidence:
        low_conf_by_type = {}
        for res in low_confidence:
            entity_type = res.entity_type
            if entity_type not in low_conf_by_type:
                low_conf_by_type[entity_type] = []
            low_conf_by_type[entity_type].append(res)
        
        for entity_type, entities in sorted(low_conf_by_type.items()):
            print(f"\n{entity_type}:")
            print("-" * 80)
            for entity in sorted(entities, key=lambda x: x.score, reverse=True):
                detected_text = original_text[entity.start:entity.end]
                print(f"  • Text: '{detected_text}'")
                print(f"    Confidence Score: {entity.score:.2f} (Below 0.3 threshold)")
                print(f"    Reason not redacted: Low confidence score")
                print(f"    Recognizer: {entity.recognition_metadata.get('recognizer_name', 'N/A')}")
                print()
    else:
        print("No low-confidence entities detected.\n")
    
    print("=" * 80)