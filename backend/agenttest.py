from dotenv import load_dotenv
from llama_index.llms.gemini import Gemini
load_dotenv()
from llama_index.core.agent import ReActAgent
#from llama_index.llms.openai import OpenAI
from llama_index.core.tools import FunctionTool
import os

def multiply(a: float, b: float) -> float:
    """Multiply two numbers and returns the product"""
    return a * b


multiply_tool = FunctionTool.from_defaults(fn=multiply)


def add(a: float, b: float) -> float:
    """Add two numbers and returns the sum"""
    return a + b


add_tool = FunctionTool.from_defaults(fn=add)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

llm = Gemini(model="models/gemini-1.5-flash",  # Or the specific Gemini model you want
                  temperature=0,  # Adjust as needed
                  api_key=GEMINI_API_KEY) # Replace with your actual key

agent = ReActAgent.from_tools([multiply_tool, add_tool], llm=llm, verbose=True)

response = agent.chat("What is 20+(2*4)? Use a tool to calculate every step.")