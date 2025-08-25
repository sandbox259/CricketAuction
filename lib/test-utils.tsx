"use client"

import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"

// Mock data for testing
export const mockTeams = [
  { id: 1, name: "Mumbai Indians", budget: 85000000 },
  { id: 2, name: "Chennai Super Kings", budget: 80000000 },
  { id: 3, name: "Royal Challengers Bangalore", budget: 90000000 },
]

export const mockPlayers = [
  {
    id: 1,
    name: "Virat Kohli",
    position: "Batsman",
    base_price: 20000000,
    current_price: 0,
    status: "available",
  },
  {
    id: 2,
    name: "MS Dhoni",
    position: "Wicket-keeper",
    base_price: 12000000,
    current_price: 15000000,
    status: "sold",
  },
]

export const mockAssignments = [
  {
    id: 1,
    player_id: 2,
    team_id: 2,
    final_price: 15000000,
    assigned_at: "2024-01-15T10:30:00Z",
    player: mockPlayers[1],
    team: mockTeams[1],
  },
]

export const mockAuctionOverview = {
  total_players: 20,
  sold_players: 5,
  unsold_players: 2,
  available_players: 13,
  total_teams: 8,
  total_budget: 720000000,
  total_spent: 150000000,
}

export const mockUser = {
  id: "user-123",
  phone: "+1234567890",
  role: "viewer",
  team_id: null,
}

export const mockAdminUser = {
  id: "admin-123",
  phone: "+1987654321",
  role: "admin",
  team_id: null,
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-testid="test-wrapper">{children}</div>
}

// Custom render function
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: TestWrapper, ...options })

export * from "@testing-library/react"
export { customRender as render }

// Utility functions for testing
export const waitForLoadingToFinish = () => new Promise((resolve) => setTimeout(resolve, 0))

export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockUser, error: null })),
      })),
      order: jest.fn(() => Promise.resolve({ data: mockPlayers, error: null })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: mockAuctionOverview, error: null })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    signInWithOtp: jest.fn(() => Promise.resolve({ error: null })),
    verifyOtp: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(),
    })),
  })),
  removeChannel: jest.fn(),
})

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
}

// Mock localStorage for testing
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
