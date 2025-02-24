"use client";
import { useMemo, useState } from "react";
// import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import debounce from "lodash/debounce";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");

  const fetchSuggestion = async (text) => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      setSuggestion(data.response);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debounceSuggestions = useMemo(() => debounce(fetchSuggestion, 400), []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setPrompt(newText);
    debounceSuggestions(newText);

    if (!newText.trim()) {
      setSuggestion("");
      return;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && suggestion) {
      e.preventDefault();
      setPrompt((prev) => prev + suggestion);
      setSuggestion("");
    } else if (e.key === "Escape") {
      setSuggestion("");
    }
  };

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
      <div className="grid w-full gap-2 relative">
        <Textarea
          placeholder="Type your message here."
          value={prompt}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />
        {suggestion && (
          <div
            className="absolute pointer-events-none text-gray-500"
            style={{
              top: 0,
              left: 0,
              padding: "0.5rem",
            }}
          >
            {prompt}
            {suggestion}
          </div>
        )}
        {/* {isLoading && <div className="absolute right-2 top-2">Loading...</div>}
        <Button onClick={handleClick}>Send message</Button> */}
      </div>
      {/* {response && (
        <div className="mt-4 p-4 bg-gray-800 text-white rounded">
          <p>{response}</p>
        </div>
      )} */}
    </div>
  );
}
