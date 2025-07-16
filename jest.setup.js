import '@testing-library/jest-dom'

// Mock the fetch API for tests
global.fetch = jest.fn()

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning:')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})