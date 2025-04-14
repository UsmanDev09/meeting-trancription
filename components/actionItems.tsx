"use client"

import * as React from "react"
import { Check, MoreVertical, X, Plus, Trash2, UserPlus, Edit2, Save } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid'

// Sample users data
const users = [
  {
    id: "1",
    name: "Alice Smith",
    email: "alice@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    name: "Bob Jones",
    email: "bob@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

interface ActionItem {
  id: string
  text: string
  completed: boolean
  user_actions: { user_id: string }[]
  due_date?: string
}

// Sample initial actions for testing
const initialActions: ActionItem[] = [
  {
    id: "1",
    text: "Review project proposal",
    completed: false,
    user_actions: [{ user_id: "1" }]
  },
  {
    id: "2",
    text: "Schedule team meeting",
    completed: true,
    user_actions: []
  }
]

export function ActionItems() {
  const [actions, setActions] = React.useState<ActionItem[]>(initialActions)
  const [newAction, setNewAction] = React.useState("")
  const [showInput, setShowInput] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editText, setEditText] = React.useState("")
  const { toast } = useToast()

  const handleAddAction = () => {
    if (newAction.trim()) {
      // Simulate loading state
      setIsLoading(true)
      
      // Create new action with UUID
      const newItem: ActionItem = {
        id: uuidv4(),
        text: newAction,
        completed: false,
        user_actions: selectedUser ? [{ user_id: selectedUser }] : []
      }
      
      // Add to local state
      setTimeout(() => {
        setActions([newItem, ...actions])
        setNewAction("")
        setShowInput(false)
        setSelectedUser("")
        setIsLoading(false)
        
        toast({
          title: "Success",
          description: "Action added successfully.",
        })
      }, 500) // Simulate network delay
    }
  }

  const toggleComplete = (id: string) => {
    // Simulate loading state
    setIsLoading(true)
    
    setTimeout(() => {
      setActions(actions.map(action => 
        action.id === id 
          ? { ...action, completed: !action.completed } 
          : action
      ))
      setIsLoading(false)
      
      const actionCompleted = actions.find(a => a.id === id)?.completed
      toast({
        title: "Success",
        description: `Action marked as ${!actionCompleted ? "completed" : "incomplete"}.`,
      })
    }, 300)
  }

  const deleteAction = (id: string) => {
    // Simulate loading state
    setIsLoading(true)
    
    setTimeout(() => {
      setActions(actions.filter(action => action.id !== id))
      setIsLoading(false)
      
      toast({
        title: "Success",
        description: "Action deleted successfully.",
      })
    }, 300)
  }

  const assignAction = (id: string, userId: string) => {
    // Simulate loading state
    setIsLoading(true)
    
    setTimeout(() => {
      setActions(actions.map(action => {
        if (action.id === id) {
          // Check if user is already assigned
          const userAlreadyAssigned = action.user_actions.some(ua => ua.user_id === userId)
          
          // If already assigned, remove assignment; otherwise add it
          const updatedUserActions = userAlreadyAssigned
            ? action.user_actions.filter(ua => ua.user_id !== userId)
            : [...action.user_actions, { user_id: userId }]
            
          return { ...action, user_actions: updatedUserActions }
        }
        return action
      }))
      
      setIsLoading(false)
      toast({
        title: "Success",
        description: "Action assignment updated successfully.",
      })
    }, 300)
  }

  const startEditing = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      setIsLoading(true)
      
      setTimeout(() => {
        setActions(actions.map(action => 
          action.id === id 
            ? { ...action, text: editText.trim() } 
            : action
        ))
        setEditingId(null)
        setEditText("")
        setIsLoading(false)
        
        toast({
          title: "Success",
          description: "Action updated successfully.",
        })
      }, 300)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {!showInput ? (
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground"
          onClick={() => setShowInput(true)}
        >
          <Plus className="h-4 w-4" />
          Add action item
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Checkbox />
          <Input
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            placeholder="Add a new action..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddAction();
            }}
          />
          <Button size="sm" onClick={handleAddAction} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowInput(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading && actions.length === 0 ? (
        <div>Loading actions...</div>
      ) : actions.length > 0 ? (
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={action.id} className="flex items-center gap-2 rounded-lg border p-2">
              <Checkbox
                checked={action.completed}
                onCheckedChange={() => toggleComplete(action.id)}
                disabled={isLoading || editingId === action.id}
              />
              
              {editingId === action.id ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(action.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <Button size="sm" onClick={() => saveEdit(action.id)} disabled={isLoading}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span className={`flex-1 ${action.completed ? "text-muted-foreground line-through" : ""}`}>
                  {action.text}
                </span>
              )}
              
              {editingId !== action.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEditing(action.id, action.text)}
                    disabled={isLoading}
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit action</span>
                  </Button>
                  
                  <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading}>
                        <UserPlus className="h-4 w-4" />
                        <span className="sr-only">Assign to</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="right" align="start" className="w-80 p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." value={searchQuery} onValueChange={setSearchQuery} />
                        <CommandList>
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            {filteredUsers.map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => {
                                  assignAction(action.id, user.id)
                                  setSearchQuery("")
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                                  {action.user_actions.some((ua) => ua.user_id === user.id) && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </HoverCardContent>
                  </HoverCard>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteAction(action.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete action</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <h3 className="font-semibold">No current action items</h3>
          <p className="text-sm text-muted-foreground">Your action items will appear here when assigned</p>
        </div>
      )}
    </div>
  )
}