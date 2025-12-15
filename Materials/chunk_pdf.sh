#!/bin/bash
INPUT_PDF="$1"
CHUNK_SIZE=5
BASENAME=$(basename "$INPUT_PDF" .pdf)
PARENT_DIR=$(dirname "$INPUT_PDF")
OUT_DIR="${PARENT_DIR}/${BASENAME}_chunks" # Re-constructing with quotes

echo "Input PDF: $INPUT_PDF"
echo "Output Directory: $OUT_DIR"

mkdir -p "$OUT_DIR"
if [ ! -d "$OUT_DIR" ]; then
    echo "Error: Could not create output directory $OUT_DIR"
    exit 1
fi

echo "Splitting '$INPUT_PDF' into pages in '$OUT_DIR'..."
pdfseparate "$INPUT_PDF" "${OUT_DIR}/page-%d.pdf" # Ensuring quoting here

# Count pages
# Use find to get files in case of special characters, and pipe to wc -l
NUM_PAGES=$(find "$OUT_DIR" -maxdepth 1 -name "page-*.pdf" | wc -l)
# Or just parse from pdfinfo if that's more robust
# NUM_PAGES=$(pdfinfo "$INPUT_PDF" | grep Pages | awk '{print $2}')

echo "Total pages: $NUM_PAGES"

# Get sorted list of files
# mapfile -t PAGES < <(ls -1v "${OUT_DIR}"/page-*.pdf) # Use -1v for natural sort
# No, `ls` is bad with spaces. `find` combined with `sort` is better.
PAGES=()
while IFS= read -r -d $'\0' file; do
    PAGES+=("$file")
done < <(find "${OUT_DIR}" -maxdepth 1 -name "page-*.pdf" -print0 | sort -zV)


# Unite into chunks
chunk_counter=1
for ((i=0; i<NUM_PAGES; i+=CHUNK_SIZE)); do
    chunk_files=()
    for ((j=i; j<i+CHUNK_SIZE && j<NUM_PAGES; j++)); do
        chunk_files+=("${PAGES[j]}")
    done
    
    OUTPUT_CHUNK="${OUT_DIR}/${BASENAME}_part_$(printf "%03d" $chunk_counter).pdf"
    echo "Creating chunk $chunk_counter with ${#chunk_files[@]} pages: '$OUTPUT_CHUNK'"
    pdfunite "${chunk_files[@]}" "$OUTPUT_CHUNK"
    ((chunk_counter++))
done

# Cleanup single pages
echo "Cleaning up single pages..."
rm "${OUT_DIR}"/page-*.pdf

echo "Created chunks in $OUT_DIR"
ls -1 "${OUT_DIR}"/*.pdf
