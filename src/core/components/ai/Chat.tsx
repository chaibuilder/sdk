"use client";

import type React from "react";

import { useChat } from "@ai-sdk/react";
import { Image, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../../ui";

export function Chat() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    initialMessages: [],
    onResponse: (response) => {
      // Scroll to top when new message comes in
      setTimeout(() => {
        const chatDiv = document.getElementById("chat-messages");
        if (chatDiv) {
          chatDiv.scrollTop = 0;
        }
      }, 100);
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((input.trim() || selectedImage) && !isLoading) {
      // In a real implementation, you would handle the image upload here
      // and include the image URL in the message content or as an attachment

      handleSubmit(e);
      setSelectedImage(null);
      setSelectedFile(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
  };

  const startNewChat = () => {
    // Clear the chat history
    window.location.reload();
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Chat Area */}
      <div id="chat-messages" className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="pt-2 text-xs text-muted-foreground">No messages yet. Start a conversation!</div>
        ) : (
          <div className="space-y-4">
            {isLoading && <div className="mr-8 animate-pulse rounded-lg bg-muted p-3 text-sm">Thinking...</div>}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                Error: {error.message || "Something went wrong"}
              </div>
            )}
            {[...messages].reverse().map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-2 text-xs ${message.role === "user" ? "ml-8 bg-primary/10" : "mr-8 bg-muted"}`}>
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleFormSubmit} className="border-t bg-background/95 py-2 backdrop-blur-sm">
        {selectedImage && (
          <div className="relative mb-2 inline-block">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Selected"
              className="h-16 w-16 rounded-md border object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0"
              onClick={removeImage}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <textarea
            ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
            placeholder="Ask something..."
            className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() || selectedImage) {
                  handleFormSubmit(e as unknown as React.FormEvent);
                }
              }
            }}
          />
          <div className="flex items-center justify-between">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                <Image className="h-5 w-5" />
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={isLoading}
              />
            </label>
            <Button
              type="submit"
              className="h-10 shrink-0 rounded-full px-4"
              disabled={isLoading || (!input.trim() && !selectedImage)}>
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
