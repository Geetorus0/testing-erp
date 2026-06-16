'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Pencil,
  BookOpen,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface Book {
  id: string
  isbn: string | null
  title: string
  author: string
  publisher: string | null
  publicationYear: number | null
  category: string | null
  totalCopies: number
  availableCopies: number
  shelf: string | null
  price: number | null
  description: string | null
  coverImage: string | null
  createdAt: Date
  updatedAt: Date
}

interface BookFormData {
  isbn: string
  title: string
  author: string
  publisher: string
  publicationYear: string
  category: string
  totalCopies: string
  shelf: string
  price: string
  description: string
}

const defaultFormData: BookFormData = {
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  publicationYear: '',
  category: '',
  totalCopies: '1',
  shelf: '',
  price: '',
  description: ''
}

const bookCategories = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Engineering',
  'Literature',
  'History',
  'Economics',
  'Management',
  'Philosophy',
  'Psychology',
  'Other'
]

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<BookFormData>(defaultFormData)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
      if (availabilityFilter && availabilityFilter !== 'all') params.set('availability', availabilityFilter)

      const response = await fetch(`/api/library/books?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setBooks(result.books)
        setCategories(result.categories)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, categoryFilter, availabilityFilter])

  const handleAddBook = async () => {
    if (!formData.title || !formData.author) {
      toast.error('Title and Author are required')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/library/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Book added successfully')
        setShowAddDialog(false)
        setFormData(defaultFormData)
        fetchBooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add book')
      }
    } catch {
      toast.error('Failed to add book')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBook = async () => {
    if (!selectedBook) return
    if (!formData.title || !formData.author) {
      toast.error('Title and Author are required')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/library/books', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBook.id, ...formData })
      })

      if (response.ok) {
        toast.success('Book updated successfully')
        setShowEditDialog(false)
        setSelectedBook(null)
        setFormData(defaultFormData)
        fetchBooks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update book')
      }
    } catch {
      toast.error('Failed to update book')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (book: Book) => {
    setSelectedBook(book)
    setFormData({
      isbn: book.isbn || '',
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear?.toString() || '',
      category: book.category || '',
      totalCopies: book.totalCopies.toString(),
      shelf: book.shelf || '',
      price: book.price?.toString() || '',
      description: book.description || ''
    })
    setShowEditDialog(true)
  }

  const openDetailsDialog = (book: Book) => {
    setSelectedBook(book)
    setShowDetailsDialog(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Book Catalog
              </CardTitle>
              <CardDescription>Manage library books and inventory</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, ISBN, publisher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...categories, ...bookCategories.filter(c => !categories.includes(c))].filter(Boolean).map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Books Table */}
          {books.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="hidden md:table-cell">ISBN</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-center">Copies</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetailsDialog(book)}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell className="hidden md:table-cell">{book.isbn || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {book.category && <Badge variant="outline">{book.category}</Badge>}
                      </TableCell>
                      <TableCell className="text-center">{book.totalCopies}</TableCell>
                      <TableCell className="text-center">{book.availableCopies}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={book.availableCopies > 0 ? 'default' : 'destructive'}
                          className={book.availableCopies > 0 ? 'bg-emerald-600' : ''}
                        >
                          {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(book)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No books found</p>
              <p className="text-sm">Try adjusting your search or add a new book</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Book Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
            <DialogDescription>Enter the details for the new book</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Book title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="ISBN number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Publisher name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicationYear">Publication Year</Label>
              <Input
                id="publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                placeholder="e.g., 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {bookCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCopies">Total Copies</Label>
              <Input
                id="totalCopies"
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                placeholder="Number of copies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shelf">Shelf Location</Label>
              <Input
                id="shelf"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                placeholder="e.g., A-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Book price"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Book description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBook} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Book'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Book title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-author">Author *</Label>
              <Input
                id="edit-author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-isbn">ISBN</Label>
              <Input
                id="edit-isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="ISBN number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-publisher">Publisher</Label>
              <Input
                id="edit-publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Publisher name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-publicationYear">Publication Year</Label>
              <Input
                id="edit-publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })}
                placeholder="e.g., 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {bookCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-totalCopies">Total Copies</Label>
              <Input
                id="edit-totalCopies"
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                placeholder="Number of copies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-shelf">Shelf Location</Label>
              <Input
                id="edit-shelf"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                placeholder="e.g., A-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₹)</Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Book price"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Book description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditBook} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
            <DialogDescription>by {selectedBook?.author}</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ISBN</p>
                  <p className="font-medium">{selectedBook.isbn || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publisher</p>
                  <p className="font-medium">{selectedBook.publisher || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publication Year</p>
                  <p className="font-medium">{selectedBook.publicationYear || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedBook.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shelf Location</p>
                  <p className="font-medium">{selectedBook.shelf || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{selectedBook.price ? `₹${selectedBook.price}` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Copies</p>
                  <p className="font-medium">{selectedBook.totalCopies}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Copies</p>
                  <Badge variant={selectedBook.availableCopies > 0 ? 'default' : 'destructive'} className={selectedBook.availableCopies > 0 ? 'bg-emerald-600' : ''}>
                    {selectedBook.availableCopies}
                  </Badge>
                </div>
              </div>
              {selectedBook.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedBook.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
            <Button onClick={() => {
              setShowDetailsDialog(false)
              if (selectedBook) openEditDialog(selectedBook)
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
