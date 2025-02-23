"use client";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleClick = async () => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
      style={{ backgroundColor: "#2d2d2d", color: "#e0e0e0" }}
    >
      <div className="grid w-full gap-2">
        <Textarea
          placeholder="Type your message here."
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleClick}>Send message</Button>
      </div>
      {response && (
        <div className="mt-4 p-4 bg-gray-800 text-white rounded">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
