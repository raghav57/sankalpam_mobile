import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SankalpamColors } from "@/constants/sankalpam";
import { useBooking, type BookingMode } from "@/contexts/BookingContext";

import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";

function startOfDay(date: Date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function scheduledDateTime(date: Date, time: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0,
  );
}

export default function BookingFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setDraft } = useBooking();

  const [bookingMode, setBookingMode] = useState<BookingMode>("ONLINE");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [showIOSDatePicker, setShowIOSDatePicker] = useState(false);
  const [showIOSTimePicker, setShowIOSTimePicker] = useState(false);
  const [draftTime, setDraftTime] = useState(() => new Date());
  const latestTime = useRef(draftTime);
  const [isConfirmingTime, setIsConfirmingTime] = useState(false);
  const timeCommitRequested = useRef(false);
  const timeCommitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(
    () => () => {
      if (timeCommitTimer.current !== null)
        clearTimeout(timeCommitTimer.current);
    },
    [],
  );

  function commitDate(date: Date) {
    const day = startOfDay(date);
    if (day.getTime() < startOfDay(new Date()).getTime()) {
      Alert.alert("Invalid schedule", "Please select today or a future date.");
      return;
    }
    setSelectedDate(day);
    if (
      selectedTime &&
      scheduledDateTime(day, selectedTime).getTime() <= Date.now()
    ) {
      setSelectedTime(null);
      Alert.alert(
        "Choose a time",
        "Please select a future time for this date.",
      );
    }
  }

  function commitTime(time: Date) {
    // Android does not support minimumDate in time mode. Validate the actual
    // booking day plus clock time on both platforms, not the picker's hidden day.
    if (
      selectedDate &&
      scheduledDateTime(selectedDate, time).getTime() <= Date.now()
    ) {
      Alert.alert("Invalid schedule", "Please select a future date and time.");
      return false;
    }
    const minute = new Date(time);
    minute.setSeconds(0, 0);
    setSelectedTime(minute);
    return true;
  }

  function cancelTimeCommit() {
    if (timeCommitTimer.current !== null) clearTimeout(timeCommitTimer.current);
    timeCommitTimer.current = null;
    timeCommitRequested.current = false;
    setIsConfirmingTime(false);
  }

  function scheduleTimeCommit() {
    if (timeCommitTimer.current !== null) clearTimeout(timeCommitTimer.current);
    // Keep the native spinner mounted while queued wheel events arrive. Each
    // event restarts this quiet period; the ref avoids a stale state snapshot.
    timeCommitTimer.current = setTimeout(() => {
      timeCommitTimer.current = null;
      timeCommitRequested.current = false;
      setIsConfirmingTime(false);
      if (commitTime(latestTime.current)) setShowIOSTimePicker(false);
    }, 250);
  }

  function openDatePicker() {
    const today = startOfDay(new Date());
    const initialDate =
      selectedDate && selectedDate >= today ? selectedDate : today;
    cancelTimeCommit();
    setShowIOSTimePicker(false);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: "date",
        minimumDate: today,
        display: "calendar",
        onValueChange: (_event, date) => commitDate(date),
      });
    } else {
      setShowIOSDatePicker(true);
    }
  }

  function openTimePicker() {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1, 0, 0);
    let initialTime = scheduledDateTime(
      selectedDate ?? nextMinute,
      selectedTime ?? nextMinute,
    );
    if (initialTime.getTime() <= now.getTime()) initialTime = nextMinute;
    cancelTimeCommit();
    setShowIOSDatePicker(false);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialTime,
        mode: "time",
        is24Hour: false,
        display: "spinner",
        onValueChange: (_event, time) => {
          commitTime(time);
        },
      });
    } else {
      latestTime.current = initialTime;
      setDraftTime(initialTime);
      setShowIOSTimePicker(true);
    }
  }

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatTime(time: Date) {
    return time.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function continueToReview() {
    if (showIOSTimePicker) {
      Alert.alert(
        "Confirm time",
        "Tap Done to confirm your preferred time first.",
      );
      return;
    }
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      Alert.alert("Invalid pooja", "Please select a pooja again.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert("Missing details", "Enter your preferred date and time.");
      return;
    }

    // Validate that the selected date and time are in the future
    const scheduledAt = scheduledDateTime(selectedDate, selectedTime);

    if (scheduledAt.getTime() <= Date.now()) {
      Alert.alert("Invalid schedule", "Please select a future date and time.");
      return;
    }

    if (
      bookingMode === "IN_PERSON" &&
      (!address.trim() || !city.trim() || !state.trim())
    ) {
      Alert.alert(
        "Missing location",
        "Enter the pooja address, city and state.",
      );
      return;
    }

    // Review screen will be connected in the next step.
    setDraft({
      poojaId: Number(id),
      mode: bookingMode,
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
      address: bookingMode === "IN_PERSON" ? address.trim() : "",
      city: bookingMode === "IN_PERSON" ? city.trim() : "",
      state: bookingMode === "IN_PERSON" ? state.trim() : "",
      instructions: instructions.trim(),
    });

    router.push("/booking/review");
  }

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Book a Pooja",
          headerStyle: { backgroundColor: SankalpamColors.cream },
          headerTintColor: SankalpamColors.saffron,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Text style={styles.heading}>Choose your booking preferences</Text>

          <Text style={styles.label}>How would you like to attend?</Text>

          <View style={styles.modeRow}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: bookingMode === "ONLINE" }}
              onPress={() => setBookingMode("ONLINE")}
              style={[
                styles.modeButton,
                bookingMode === "ONLINE" && styles.modeSelected,
              ]}
            >
              <Text style={styles.modeText}>Online Pooja</Text>
            </Pressable>

            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: bookingMode === "IN_PERSON" }}
              onPress={() => setBookingMode("IN_PERSON")}
              style={[
                styles.modeButton,
                bookingMode === "IN_PERSON" && styles.modeSelected,
              ]}
            >
              <Text style={styles.modeText}>In-Person Pooja</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Preferred Date</Text>
          <Pressable
            accessibilityRole="button"
            onPress={openDatePicker}
            style={styles.input}
          >
            <Text style={styles.pickerText}>
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </Text>
          </Pressable>

          <Text style={styles.label}>Preferred Time</Text>
          <Pressable
            accessibilityRole="button"
            onPress={openTimePicker}
            style={styles.input}
          >
            <Text style={styles.pickerText}>
              {selectedTime ? formatTime(selectedTime) : "Select a time"}
            </Text>
          </Pressable>

          {Platform.OS === "ios" && showIOSDatePicker && (
            <View style={styles.pickerPanel}>
              <DateTimePicker
                value={selectedDate ?? startOfDay(new Date())}
                mode="date"
                display="inline"
                minimumDate={startOfDay(new Date())}
                themeVariant="light"
                accentColor={SankalpamColors.saffron}
                textColor={SankalpamColors.text}
                onValueChange={(_event, date) => commitDate(date)}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  commitDate(selectedDate ?? startOfDay(new Date()));
                  setShowIOSDatePicker(false);
                }}
              >
                <Text style={styles.pickerDone}>Done</Text>
              </Pressable>
            </View>
          )}

          {Platform.OS === "ios" && showIOSTimePicker && (
            <View style={styles.pickerPanel}>
              <DateTimePicker
                value={draftTime}
                mode="time"
                display="spinner"
                is24Hour={false}
                themeVariant="light"
                textColor={SankalpamColors.saffron}
                onValueChange={(_event, time) => {
                  latestTime.current = time;
                  setDraftTime(time);
                  if (timeCommitRequested.current) scheduleTimeCommit();
                }}
              />
              <Pressable
                accessibilityRole="button"
                disabled={isConfirmingTime}
                accessibilityState={{ busy: isConfirmingTime }}
                onPress={() => {
                  timeCommitRequested.current = true;
                  setIsConfirmingTime(true);
                  scheduleTimeCommit();
                }}
              >
                <Text style={styles.pickerDone}>
                  {isConfirmingTime ? "Confirming…" : "Done"}
                </Text>
              </Pressable>
            </View>
          )}

          {bookingMode === "IN_PERSON" && (
            <>
              <Text style={styles.label}>Pooja Address</Text>
              <TextInput
                style={styles.input}
                placeholder="House / street / venue"
                placeholderTextColor="#64748B"
                value={address}
                onChangeText={setAddress}
              />

              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#64748B"
                value={city}
                onChangeText={setCity}
              />

              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#64748B"
                value={state}
                onChangeText={setState}
              />
            </>
          )}

          <Text style={styles.label}>Special Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Anything the priest should know?"
            placeholderTextColor="#64748B"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={4}
          />

          <Pressable
            accessibilityRole="button"
            onPress={continueToReview}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>Continue to Review</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SankalpamColors.cream },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 24,
    gap: 14,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: SankalpamColors.saffron,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: SankalpamColors.text,
  },
  modeRow: { flexDirection: "row", gap: 12 },
  modeButton: {
    flex: 1,
    backgroundColor: SankalpamColors.white,
    borderWidth: 1,
    borderColor: SankalpamColors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modeSelected: {
    borderColor: SankalpamColors.saffron,
    borderWidth: 2,
  },
  modeText: {
    color: SankalpamColors.text,
    fontWeight: "600",
  },
  input: {
    backgroundColor: SankalpamColors.white,
    borderWidth: 1,
    borderColor: SankalpamColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: SankalpamColors.text,
  },
  multiline: { minHeight: 100, textAlignVertical: "top" },
  submitButton: {
    backgroundColor: SankalpamColors.saffron,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
  },
  submitText: {
    color: SankalpamColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pickerText: {
    color: SankalpamColors.saffron,
    fontSize: 17,
    fontWeight: "600",
  },
  pickerDone: {
    color: SankalpamColors.saffron,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    padding: 12,
  },
  pickerPanel: {
    backgroundColor: SankalpamColors.cream,
    borderRadius: 12,
  },
});
