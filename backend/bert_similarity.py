import sys
import json
import torch
from transformers import AutoTokenizer, AutoModel

# Usamos un modelo de Sentence-Transformers compatible con la API estándar de Hugging Face
# Es ligero (118M params, ~220MB), multilingüe y diseñado específicamente para similitud semántica.
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0] # First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

def get_embeddings(texts, tokenizer, model):
    encoded_input = tokenizer(texts, padding=True, truncation=True, return_tensors='pt', max_length=512)
    with torch.no_grad():
        model_output = model(**encoded_input)
    sentence_embeddings = mean_pooling(model_output, encoded_input['attention_mask'])
    # Normalizar los embeddings para calcular directamente la similitud del coseno vía producto punto
    return torch.nn.functional.normalize(sentence_embeddings, p=2, dim=1)

def main():
    try:
        # Leer datos de entrada desde stdin
        input_data = json.loads(sys.stdin.read())
        new_desc = input_data.get("new_description")
        existing_descs = input_data.get("existing_descriptions", [])
        
        if not new_desc or not existing_descs:
            print(json.dumps({"similarities": []}))
            return

        # Cargar modelo y tokenizador
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModel.from_pretrained(MODEL_NAME)

        texts = [new_desc] + existing_descs
        embeddings = get_embeddings(texts, tokenizer, model)
        
        new_emb = embeddings[0]
        exist_embs = embeddings[1:]
        
        # Similitud del coseno (producto punto de embeddings normalizados)
        similarities = torch.mm(exist_embs, new_emb.unsqueeze(1)).squeeze(1).tolist()
        
        # Asegurarse de retornar una lista si es un único valor float
        if isinstance(similarities, float):
            similarities = [similarities]
            
        print(json.dumps({"similarities": similarities}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
