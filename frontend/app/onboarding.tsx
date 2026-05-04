//frontend/app/onboarding.tsx
// frontend/app/onboarding.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useAuth } from "../src/contexts/auth";

import ProgressBar from "../src/components/onboarding/ProgressBar";
import Step1Style from "../src/components/onboarding/Step1Style";
import Step2Colors from "../src/components/onboarding/Step2Colors";
import Step3Occasions from "../src/components/onboarding/Step3Occasions";
import Step4Seasons from "../src/components/onboarding/Step4Seasons";
import Step5Goals from "../src/components/onboarding/Step5Goals";
import StepComplete from "../src/components/onboarding/StepComplete";

export interface OnboardingData {
  styles: string[];
  colors: Array<{ name: string; hex: string }>;
  occasions: string[];
  seasons: string[];
  goals: string[];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  const [data, setData] = useState<OnboardingData>({
    styles: [],
    colors: [],
    occasions: [],
    seasons: [],
    goals: [],
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding(data);
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error al saltar onboarding:", error);
      router.replace("/(tabs)");
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(data);
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error guardando onboarding:", error);
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.styles.length > 0;
      case 2:
        return data.colors.length > 0;
      case 3:
        return data.occasions.length > 0;
      case 4:
        return data.seasons.length > 0;
      case 5:
        return data.goals.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Style
            selectedStyles={data.styles}
            onUpdate={(styles: string[]) => updateData("styles", styles)}
          />
        );

      case 2:
        return (
          <Step2Colors
            selectedColors={data.colors}
            onUpdate={(colors: Array<{ name: string; hex: string }>) =>
              updateData("colors", colors)
            }
          />
        );

      case 3:
        return (
          <Step3Occasions
            selectedOccasions={data.occasions}
            onUpdate={(occasions: string[]) =>
              updateData("occasions", occasions)
            }
          />
        );

      case 4:
        return (
          <Step4Seasons
            selectedSeasons={data.seasons}
            onUpdate={(seasons: string[]) => updateData("seasons", seasons)}
          />
        );

      case 5:
        return (
          <Step5Goals
            selectedGoals={data.goals}
            onUpdate={(goals: string[]) => updateData("goals", goals)}
          />
        );

      case 6:
        return <StepComplete onComplete={handleComplete} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {currentStep < totalSteps && (
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerTitleRow}>
                  <Ionicons name="sparkles" size={16} color="#4A6FA5" />
                  <Text style={styles.headerTitle}>Descubre tu estilo</Text>
                </View>

                <Pressable onPress={handleSkip}>
                  <Text style={styles.skipText}>Saltar</Text>
                </Pressable>
              </View>

              <ProgressBar
                currentStep={currentStep}
                totalSteps={totalSteps - 1}
              />
            </View>
          )}

          <View
            style={[
              styles.card,
              currentStep === totalSteps
                ? styles.completeCardHeight
                : styles.normalCardHeight,
            ]}
          >
            <View style={styles.stepContent}>{renderStep()}</View>

            {currentStep < totalSteps && (
              <View style={styles.navigationContainer}>
                {currentStep > 1 && (
                  <Pressable onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Atrás</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleNext}
                  disabled={!canProceed()}
                  style={styles.continueWrapper}
                >
                  {canProceed() ? (
                    <LinearGradient
                      colors={["#4A6FA5", "#8FB8A8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.continueButton}
                    >
                      <Text style={styles.continueButtonText}>Continuar</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.disabledButton}>
                      <Text style={styles.disabledButtonText}>Continuar</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF3F7",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A6FA5",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  normalCardHeight: {
    minHeight: 620,
  },
  completeCardHeight: {
    minHeight: 620,
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#EEF3F7",
  },
  backButtonText: {
    color: "#4B5563",
    fontWeight: "700",
  },
  continueWrapper: {
    flex: 1,
  },
  continueButton: {
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  disabledButton: {
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "#D1D5DB",
  },
  disabledButtonText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 15,
  },
});