import React from 'react'

export default class ErrorBoundary extends React.Component<{
  fallback: React.ReactNode
}> {
  state = { error: false }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    // Log or store the error
    console.error(error)
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}
