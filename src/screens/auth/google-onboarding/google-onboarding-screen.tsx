import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, ScreenContainer, ThemedText } from '@/components';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { routes } from '@/navigation/routes';
import { theme } from '@/theme';

import { styles } from './styles';

type AccountType = 'DONOR' | 'INSTITUTION';

const OPTIONS: {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: AccountType;
}[] = [
  {
    description: 'Doe, siga instituições, comente e acompanhe campanhas.',
    icon: 'person-circle-outline',
    label: 'Sou doador',
    value: 'DONOR',
  },
  {
    description: 'Crie campanhas, defina metas e preste contas aos doadores.',
    icon: 'business-outline',
    label: 'Sou instituição',
    value: 'INSTITUTION',
  },
];

export function GoogleOnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    onboardingToken?: string;
    name?: string;
    email?: string;
  }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = theme.colors[scheme];
  const [accountType, setAccountType] = useState<AccountType>('DONOR');

  const onboardingToken = params.onboardingToken ?? '';
  const googleName = params.name ?? '';
  const googleEmail = params.email ?? '';

  function handleContinue() {
    router.push(
      `${routes.authGoogleOnboardingDetails}?onboardingToken=${encodeURIComponent(onboardingToken)}&name=${encodeURIComponent(googleName)}&email=${encodeURIComponent(googleEmail)}&accountType=${accountType}` as Href,
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.logoMark, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="logo-google" size={28} color={colors.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>
            {googleName ? `Quase lá, ${googleName.split(' ')[0]}` : 'Quase lá'}
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.subtitle}>
            Escolha como você quer participar do EloDoar.
          </ThemedText>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = accountType === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setAccountType(option.value)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: selected ? colors.primarySoft : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                  pressed ? styles.pressed : undefined,
                ]}>
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: selected ? colors.primary : colors.primarySoft },
                  ]}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={selected ? colors.surface : colors.primary}
                  />
                </View>
                <View style={styles.optionText}>
                  <ThemedText variant="body" style={styles.bold}>
                    {option.label}
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.textMuted}>
                    {option.description}
                  </ThemedText>
                </View>
                <View style={styles.checkSlot}>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Button fullWidth style={styles.continueButton} onPress={handleContinue}>
          Continuar
        </Button>
      </View>
    </ScreenContainer>
  );
}
