import subprocess
import json
import sys

def test_bert():
    # Datos de prueba con descripciones semánticamente muy parecidas y otras distintas
    test_input = {
        "new_description": "Hay un bache gigante en medio de la calle que está rompiendo los neumáticos de todos los autos que pasan.",
        "existing_descriptions": [
            "Cuidado en la esquina, hay un pozo enorme sobre el asfalto que daña las ruedas de los vehículos.", # Duplicado semántico (alto score esperado)
            "Una lámpara del poste de luz de la vereda está completamente apagada y rota desde hace días.", # Problema distinto (bajo score esperado)
            "Acumulación excesiva de residuos y basura en el contenedor municipal de la plaza central." # Problema distinto (bajo score esperado)
        ]
    }
    
    print("Iniciando prueba aislada de BERT...")
    print(f"Nuevo reporte: '{test_input['new_description']}'\n")
    print("Comparando contra:")
    for idx, desc in enumerate(test_input['existing_descriptions']):
        print(f"  {idx + 1}. '{desc}'")
    print("\nEjecutando bert_similarity.py...")

    try:
        # Ejecutar bert_similarity.py como un subproceso pasando el JSON por stdin
        process = subprocess.Popen(
            ["python", "bert_similarity.py"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=json.dumps(test_input))
        
        if process.returncode != 0:
            print(f"Error al ejecutar el script de BERT: {stderr}", file=sys.stderr)
            sys.exit(1)
            
        result = json.loads(stdout)
        
        if "error" in result:
            print(f"Error devuelto por el modelo: {result['error']}", file=sys.stderr)
            sys.exit(1)
            
        print("\nResultados obtenidos de BERT:")
        similarities = result.get("similarities", [])
        for idx, score in enumerate(similarities):
            status = "DUPLICADO SEMÁNTICO (Aceptado)" if score > 0.75 else "DIFERENTE (Rechazado como duplicado)"
            print(f"  Comparación {idx + 1}: Similitud = {score:.4f} -> Estado: {status}")
            
        print("\n¡Prueba completada con éxito!")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    test_bert()
