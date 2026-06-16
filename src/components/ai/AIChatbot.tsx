'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Calendar,
  DollarSign,
  GraduationCap,
  HelpCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SuggestedQuestion {
  icon: React.ElementType
  text: string
  category: string
}

const suggestedQuestions: SuggestedQuestion[] = [
  {
    icon: Calendar,
    text: "What's my attendance summary for this semester?",
    category: 'Attendance'
  },
  {
    icon: BookOpen,
    text: "What courses am I enrolled in this semester?",
    category: 'Academics'
  },
  {
    icon: DollarSign,
    text: "What's my pending fee amount?",
    category: 'Finance'
  },
  {
    icon: GraduationCap,
    text: "Am I eligible for upcoming placement drives?",
    category: 'Placement'
  },
  {
    icon: HelpCircle,
    text: "How can I apply for a scholarship?",
    category: 'Finance'
  },
  {
    icon: BookOpen,
    text: "Who is my faculty for Data Structures?",
    category: 'Academics'
  }
]

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I was unable to process your request. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  const clearChat = () => {
    setMessages([])
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="h-[calc(100vh-12rem)] min-h-[500px] flex flex-col bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex-shrink-0 border-b bg-gradient-to-r from-emerald-600/10 to-teal-600/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg shadow-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">CampusOS AI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online • Ready to help
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-4">
                <div className="p-4 bg-emerald-600/10 rounded-full mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Welcome to CampusOS AI</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  I can help you with attendance, academics, placements, fees, and more. 
                  Ask me anything about your college experience!
                </p>

                {/* Suggested Questions */}
                <div className="w-full max-w-2xl">
                  <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSuggestedQuestion(question.text)}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:border-emerald-500/50 transition-all text-left group"
                      >
                        <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <question.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{question.text}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {question.category}
                          </Badge>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-emerald-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                          message.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-md'
                            : 'bg-card border rounded-bl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={cn(
                            'text-xs mt-1',
                            message.role === 'user'
                              ? 'text-emerald-100'
                              : 'text-muted-foreground'
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                          className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                          className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t bg-card/50 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about attendance, courses, fees, placements..."
              disabled={isLoading}
              className="flex-1 bg-background"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by CampusOS AI • Supports academic, attendance, placement & finance queries
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
