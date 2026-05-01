import { View, type ViewProps } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { FeedbackState } from '@/components/feedback-state';
import { Loading } from '@/components/loading';

import { styles } from './styles';

type StateContent = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

type ScreenStateProps = ViewProps & {
  loading?: boolean;
  empty?: boolean;
  error?: StateContent | null;
  success?: StateContent | null;
  loadingLabel?: string;
  emptyState?: StateContent;
  children: React.ReactNode;
};

export function ScreenState({
  children,
  empty,
  emptyState,
  error,
  loading,
  loadingLabel = 'Carregando informacoes',
  style,
  success,
  ...props
}: ScreenStateProps) {
  if (loading) {
    return (
      <View style={[styles.root, style]} {...props}>
        <Loading label={loadingLabel} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.root, style]} {...props}>
        <FeedbackState
          title={error.title}
          description={error.description}
          primaryAction={error.action}
          variant="error"
        />
      </View>
    );
  }

  if (empty) {
    return (
      <View style={[styles.root, style]} {...props}>
        <EmptyState
          title={emptyState?.title ?? 'Nenhum resultado encontrado'}
          description={emptyState?.description}
          action={emptyState?.action}
        />
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.root, style]} {...props}>
        <FeedbackState
          title={success.title}
          description={success.description}
          primaryAction={success.action}
          variant="success"
        />
      </View>
    );
  }

  return <>{children}</>;
}
