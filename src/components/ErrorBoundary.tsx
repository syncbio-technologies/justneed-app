import React, { ReactNode } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.surface, justifyContent: 'center', padding: spacing.lg }}>
          <ScrollView>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.error, marginBottom: spacing.md }}>
              Something went wrong
            </Text>
            <Text style={{ fontSize: 14, color: colors.gray600, marginBottom: spacing.md }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.gray500, fontFamily: 'monospace' }}>
              {this.state.error?.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
