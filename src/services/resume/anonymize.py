import fitz # PyMuPDF
import sys
import json
import os

# Set UTF-8 encoding for stdout to handle Unicode characters on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

current_dir = os.path.dirname(os.path.abspath(__file__))

# Parse command line arguments
if len(sys.argv) > 1:
    # Get the JSON data from file path (first argument)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        analysis_results = json.load(f)
    # Get the pdf_path from second argument if provided
    pdf_path = sys.argv[2] if len(sys.argv) > 2 else "resume.pdf"
else:
    # Fallback to default values if no arguments provided
    analysis_results = ['AKSHIT MISHRA',
      'avengers2405',
      'notadecoder',
      'akshit-mishra',
      'akshitmishra24@gmail.com',
      '+91-9284342852',
      'akshit-mishra',
      'avengers2405'
    ]
    pdf_path = "resume.pdf"


def redact_precise_strings(input_pdf, output_pdf, strings_to_redact):
    """
    input_pdf: path to the source file
    output_pdf: path to save the redacted file
    strings_to_redact: list of strings e.g. ["Rajesh Gupta", "9876543210", "rk_dev"]
    """
    # Open the PDF
    doc = fitz.open(input_pdf)
    
    for page in doc:
        for text in strings_to_redact:
            print("At text: ", text)
            if not text or len(text.strip()) == 0:
                continue
                
            # 1. Search for all instances of the string on the page
            # quads=True helps handle text that might be slightly tilted or non-standard
            text_instances = page.search_for(text)
            
            for inst in text_instances:
                # 2. Add a redaction annotation
                # fill=(0,0,0) makes the rectangle black. 
                # You can use (1,1,1) for white if preferred.
                page.add_redact_annot(inst, fill=(0, 0, 0))
        
        # 3. Apply the redactions to the current page
        # This physically removes the text and images under the annotation
        page.apply_redactions()

    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_pdf)
    os.makedirs(output_dir, exist_ok=True)

    # Save the result. 'deflate=True' compresses the file.
    doc.save(output_pdf, garbage=4, deflate=True)
    doc.close()
    print(f"[SUCCESS] Redaction complete. Saved to: {output_pdf}")

redact_precise_strings(os.path.join(current_dir, "../../../uploads/", pdf_path.strip('/')), os.path.join(current_dir, "../../../uploads/anonymized", pdf_path.strip('/resume')), analysis_results)
