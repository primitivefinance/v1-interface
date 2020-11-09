import React from 'react'

interface props {}

interface state {
  hasError: boolean
}
export default class ErrorBoundary extends React.Component {
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
