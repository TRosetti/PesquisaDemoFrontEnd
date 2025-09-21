'use client'
import { useState } from "react";
import styles from './page.module.css';

// Interface para tipar os dados que vêm da sua API Java
interface ResultadoOrdenacao {
  comparacoes: number;
  movimentacoes: number;
  tempoExecucaoMs: number;
  vetorOrdenado: number[]; 
}

// Interface para tipar o estado de resultado completo
interface ResultadoCompleto extends ResultadoOrdenacao {
  vetorOriginal: number[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [randomCount, setRandomCount] = useState<number>(10); 
  const [inputNumbers, setInputNumbers] = useState<string>('');
  const [result, setResult] = useState<ResultadoCompleto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('quick');

  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    setFile(e.target.files?.[0] || null);
  }

  
  // A função handleLoadFile agora só precisa do evento do formulário
  const handleLoadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    if(!file){
      setError('Por favor, selecione um arquivo.')
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8080/api/sort/load-file', {
          method: 'POST',
          body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar o arquivo: Status ${response.status}`);
      }

      const numbers: number[] = await response.json();
      setInputNumbers(numbers.join(', '));
      setResult(null); 

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRandom = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8080/api/sort/generate-random/${randomCount}`);

      if (!response.ok) {
        throw new Error(`Erro ao gerar números: Status ${response.status}`);
      }

      const numbers: number[] = await response.json();
      setInputNumbers(numbers.join(', '));
      setResult(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = async () => {
    setIsLoading(true);
    setError('');
    
    // Converte a string do input para um array de inteiros
    const numbersArray: number[] = inputNumbers
      .split(',')
      .map((str) => parseInt(str.trim(), 10))
      .filter((num) => !isNaN(num));

    if (numbersArray.length === 0) {
      setError('Por favor, carregue ou gere um vetor antes de ordenar.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/sort/${selectedAlgorithm}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // <<< ADICIONE ESTA LINHA!
        },
        body: JSON.stringify(numbersArray),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: Status ${response.status}`);
      }

      const data: ResultadoOrdenacao = await response.json();
      setResult({
        ...data,
        vetorOriginal: numbersArray,
      });
      setInputNumbers(data.vetorOrdenado.join(', '));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(`Ocorreu um erro: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <h1>Algoritmos de Ordenação</h1>
    
      <div className={styles.card}>

        {/* Seção de Carregar Arquivo */}
        <form onSubmit={handleLoadFile}>
          <div className={styles.inputContainer}>
              <input type="file" onChange={handleFileChange} />
              <button type="submit" disabled={isLoading}>Ler Arquivo</button>
          </div>
        </form>

        

        {/* Seção de Gerar Aleatórios */}
         <div className={styles.inputContainer}>
          <input
              type="number"
              value={randomCount}
              onChange={(e) => setRandomCount(Number(e.target.value))}
              placeholder="Quant. de números"
          />
          <button onClick={handleGenerateRandom} disabled={isLoading}>Gerar Aleatórios</button>
        </div>

        
        <div className={styles.inputContainer}>
            <select name="algoritmo" onChange={(e) => setSelectedAlgorithm(e.target.value)} value={selectedAlgorithm}>
              <option value="insersao">Inserção Direta</option>  
              <option value="selecao">Seleção Direta</option>  
              <option value="bubble">Bubble Sort</option>  
              <option value="shaker">Shaker Sort</option>
              <option value="shell">Shell Sort</option>       
              <option value="heap">Heap Sort</option>
              <option value="quick">Quick Sort</option>      
            </select>

          <button onClick={handleSort} disabled={isLoading}>
            Ordenar
          </button>
        </div>

      </div>
      
      <div className={styles.card}>
        

        {result ? (
          <div className={styles.resultsContainer}>
            <h2>Resultados da Ordenação</h2>
            <p className={styles.resultado}>
              **Comparações:** {result.comparacoes}
            </p>
            <p className={styles.resultado}>
              **Movimentações:** {result.movimentacoes}
            </p>
            <p className={styles.resultado}>
              **Tempo de Execução:** {result.tempoExecucaoMs}ms
            </p>
            <p className={styles.resultado}>
              **Vetor Original:** {result.vetorOriginal.join(', ')}
            </p>
            <p className={styles.resultado}>
              **Vetor Ordenado:** {result.vetorOrdenado.join(', ')}
            </p>
            
          </div>
        ): (
          <>
            <p>Números Atuais: **{inputNumbers}**</p>
            {isLoading && <p>Processando...</p>}
            {error && <p className={styles.error}>{error}</p>}
          </>

        )}
        
        
        
        
      </div>

    </main>
  );
}