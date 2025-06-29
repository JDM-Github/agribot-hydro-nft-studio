from openai import OpenAI

client = OpenAI(
    base_url="https://api.novita.ai/v3/openai",
    api_key="sk_u5APRKvRIRAgqXRTY9b2BGz2PESyH56aYG5asd3yUJg",
)

model = "qwen/qwen3-4b-fp8"
stream = False
max_tokens = 300
system_content = """
You are a helpful assistant specialized in NFT-based hydroponic farming.

Focus specifically on growing **lettuce**, such as:
- Green oak lettuce
- Lactuca sativa
- Other common hydroponic varieties

Your role is to:
- Provide **clear, concise** answers
- Suggest **diseases** that may affect lettuce in hydroponic systems
- Recommend **sprays or treatments** (organic or chemical) where appropriate
- Offer **preventive care tips** and best practices
- Avoid long explanations or unrelated information

Keep your responses **direct, simple**, and easy to follow — suitable for growers, not scientists.
"""

temperature = 1
top_p = 1
min_p = 0
top_k = 50
presence_penalty = 0
frequency_penalty = 0
repetition_penalty = 1
response_format = { "type": "text" }

def get_chat_inference(text):
    chat_completion_res = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_content,
            },
            {
                "role": "user",
                "content": text,
            }
        ],
        stream=stream,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        presence_penalty=presence_penalty,
        frequency_penalty=frequency_penalty,
        response_format=response_format,
        extra_body={
          "top_k": top_k,
          "repetition_penalty": repetition_penalty,
          "min_p": min_p
        }
    )

    if stream:
        for chunk in chat_completion_res:
            print(chunk.choices[0].delta.content or "", end="")
    else:
        print(chat_completion_res.choices[0].message.content)

if __name__ == "__main__":
    prompt = input("Hmm: ")
    get_chat_inference(prompt)