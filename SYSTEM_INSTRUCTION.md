# PDF Processing and Verification Workflow

This document outlines the standard operating procedure for verifying the integrity of generated Markdown course materials against the source PDF lectures.

## Goal
To ensure that the Markdown notes (`_generated_content/`) accurately and completely reflect the content of the source PDF slides (`_materials/`), including code examples, syntax, and key concepts.

## Prerequisites
- **Python Environment**: Ensure `pypdf` is installed.
- **Directory Structure**:
    - `_materials/<Module>/Lecture/`: Source PDF files.
    - `_generated_content/<Module>/Lecture/`: Generated Markdown files.
    - `_temp/`: Temporary directory for split files.

## Procedure

### 1. Preparation
1.  **Identify Target Files**: Locate the source PDF(s) and the corresponding Markdown file.
2.  **Create Temp Directory**: Ensure `_temp` exists.

### 2. PDF Splitting and Compression
Split large PDFs into smaller chunks (default: 5 pages) using Python, then use Ghostscript to aggressively compress them for optimal token usage.

**Step A: Split PDFs**
Use the provided Python script (`split_pdfs_script.py`) to split the source PDF into chunks.


**Execution:**
`./venv/bin/python3 split_pdfs_script.py "_materials/TARGET_MODULE/Lecture"`

**Step B: Compress Output**
Run the following command to compress the split files in `_temp` using Ghostscript. This significantly reduces file size (lowering quality) to ensure they fit within context windows.

```bash
for f in _temp/*.pdf; do 
    gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${f}_temp" "$f" && mv "${f}_temp" "$f"
done
```

### 3. Iterative Analysis and Verification
**CRITICAL**: Process split files sequentially. 

**Step-by-Step Loop:**
1.  **Read Baseline**: Read the existing Markdown file to establish context (`read_file`).
2.  **Read Split PDF**: Read **ONE** split PDF file (e.g., `Part_1.pdf`) using `read_file`.
3.  **Analyze & Compare**:
    -   **Describe Slides**: Briefly describe the content of each slide found in the PDF part (e.g., "Slide 1: Title...", "Slide 2: Syntax for...").
    -   **Cross-Reference**: Compare these observations with the corresponding Markdown sections.
    -   **Checklist**: Verify headers, code syntax/accuracy, diagrams, and exercises.
    -   **Note Discrepancies**: Log any missing content, errors, or typos.
4.  **Repeat**: Move to the next split PDF.

### 4. Reporting
-   Summarize findings.
-   Highlight specific missing sections.
-   Propose specific edits to the Markdown file.

### 5. Cleanup
-   Remove the `_temp` directory when finished.
-   DO NOT remove the `split_pdfs_script.py`

---
**Instruction to Agent:**
Follow this procedure for material verification. Ensure the splitting script is used to generate optimized, compressed chunks.