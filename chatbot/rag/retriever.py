import os
import re
import json
from typing import List, Tuple, Dict
from dotenv import load_dotenv
from rank_bm25 import BM25Okapi
from langchain_core.documents import Document
from langchain_nomic import NomicEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

load_dotenv()

PINECONE_INDEX_NAME = "placementor"
NAMESPACE = "placements"

class HybridRetriever:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = self.pc.Index(PINECONE_INDEX_NAME)
        self.embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
        self.vector_store = PineconeVectorStore(
            index_name=PINECONE_INDEX_NAME,
            embedding=self.embeddings,
            namespace=NAMESPACE
        )
        self.bm25 = None
        self.chunks: List[Document] = []
        self._build_bm25_index()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r"[a-z0-9]+", text.lower())

    def _build_bm25_index(self):
        print("Building BM25 index from Pinecone vectors...")
        all_texts = []
        self.chunks = []
                
        try:
            results = self.index.query(
                vector=[0.0] * 768,
                top_k=10000,
                include_metadata=True,
                namespace=NAMESPACE
            )
            
            for match in results.get("matches", []):
                metadata = match.get("metadata", {})
                content = metadata.get("text", "") 
                if content:
                    doc = Document(page_content=content, metadata=metadata)
                    self.chunks.append(doc)
                    all_texts.append(self._tokenize(content))
            
            if all_texts:
                self.bm25 = BM25Okapi(all_texts)
                print(f"BM25 index built with {len(self.chunks)} chunks.")
            else:
                print("No chunks found to build BM25 index.")
        except Exception as e:
            print(f"Error building BM25 index: {e}")

    def dense_search(self, query: str, top_k: 20) -> List[Tuple[Document, float]]:
        return self.vector_store.similarity_search_with_score(query, k=top_k)

    def bm25_search(self, query: str, top_k: 20) -> List[Tuple[Document, float]]:
        if not self.bm25:
            return []
        
        query_tokens = self._tokenize(query)
        scores = self.bm25.get_scores(query_tokens)
        
        # Pair with documents and sort
        doc_scores = list(zip(self.chunks, scores))
        doc_scores.sort(key=lambda x: x[1], reverse=True)
        
        return doc_scores[:top_k]

    def rrf_fusion(self, dense_hits: List[Tuple[Document, float]], sparse_hits: List[Tuple[Document, float]], k=60, top_k=15) -> List[Tuple[Document, float]]:
        scores: Dict[str, float] = {}
        doc_map: Dict[str, Document] = {}

        # Dense Ranks
        for rank, (doc, _) in enumerate(dense_hits):
            content_key = doc.page_content
            doc_map[content_key] = doc
            scores[content_key] = scores.get(content_key, 0) + 1.0 / (k + rank + 1)

        # Sparse Ranks
        for rank, (doc, _) in enumerate(sparse_hits):
            content_key = doc.page_content
            doc_map[content_key] = doc
            scores[content_key] = scores.get(content_key, 0) + 1.0 / (k + rank + 1)

        merged = [(doc_map[key], score) for key, score in scores.items()]
        merged.sort(key=lambda x: x[1], reverse=True)
        return merged[:top_k]

    def adaptive_k(self, ranked_results: List[Tuple[Document, float]], min_k=2, max_k=8) -> List[Tuple[Document, float]]:
        if len(ranked_results) <= min_k:
            return ranked_results
        
        gaps = []
        for i in range(len(ranked_results) - 1):
            gaps.append(ranked_results[i][1] - ranked_results[i+1][1])
        
        if not gaps:
            return ranked_results[:min_k]
            
        search_range = min(len(gaps), max_k - 1)
        max_gap_idx = gaps[:search_range].index(max(gaps[:search_range]))
        
        k = max(min_k, max_gap_idx + 1)
        return ranked_results[:k]

    def search(self, query: str) -> List[Tuple[Document, float]]:
        dense_hits = self.dense_search(query, top_k=20)
        sparse_hits = self.bm25_search(query, top_k=20)
        
        fused_hits = self.rrf_fusion(dense_hits, sparse_hits)
        adaptive_hits = self.adaptive_k(fused_hits)
        
        unique_sources = {}
        deduped = []
        for doc, score in adaptive_hits:
            source = doc.metadata.get("source", "unknown")
            if source not in unique_sources:
                unique_sources[source] = True
                deduped.append((doc, score))
        
        return deduped

if __name__ == "__main__":
    retriever = HybridRetriever()
    query = "What is the highest package in 2023?"
    results = retriever.search(query)
    for doc, score in results:
        print(f"Source: {doc.metadata.get('source')} | Score: {score:.4f}")
