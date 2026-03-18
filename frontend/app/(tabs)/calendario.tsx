// app/(tabs)/calendario.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/auth";
import { 
  getUserEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  getEventsByDate,
  CalendarEvent 
} from "../../src/services/calendar.service";
import { getUserOutfits } from "../../src/services/outfits.service";

// --- PALETA DE COLORES (igual que en tu ejemplo) ---
const colors = {
  bg: '#F4F2ED',
  text: '#1E232A',
  primary: '#7B8E78',
  cta: '#E07A5F',
  surface: '#FFFFFF',
  gray: '#D5D1C9',
};

export default function CalendarioScreen() {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [userOutfits, setUserOutfits] = useState<any[]>([]);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formOutfitId, setFormOutfitId] = useState("");

  // Días de ejemplo para mostrar (igual que en tu diseño)
  const days = [
    { id: 0, day: 'Lun', num: '12', hasOutfit: true },
    { id: 1, day: 'Mar', num: '13', hasOutfit: false },
    { id: 2, day: 'Mié', num: '14', hasOutfit: true },
    { id: 3, day: 'Jue', num: '15', hasOutfit: false },
    { id: 4, day: 'Vie', num: '16', hasOutfit: false },
  ];

  // Obtener el mes actual
  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  // Cargar eventos del mes
  useEffect(() => {
    if (user?.id) {
      loadEvents();
      loadOutfits();
    }
  }, [user?.id, currentMonth]);

  const loadEvents = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const data = await getUserEvents(user.id, month, year);
      setEvents(data);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOutfits = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserOutfits(user.id);
      setUserOutfits(data);
    } catch (error) {
      console.error("Error cargando outfits:", error);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayPress = (dayId: number, dayNum: string) => {
    setSelectedDay(dayId);
    
    // Crear fecha a partir del mes actual y el día seleccionado
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, parseInt(dayNum));
    const dateStr = date.toISOString().split('T')[0];
    
    setSelectedDate(dateStr);
    
    // Buscar si hay evento para ese día
    const dayEvent = events.find(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === parseInt(dayNum) &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year;
    });
    
    if (dayEvent) {
      setSelectedEvent(dayEvent);
      setFormTitle(dayEvent.title);
      setFormDescription(dayEvent.description || "");
      setFormStartTime(dayEvent.startTime || "");
      setFormEndTime(dayEvent.endTime || "");
      setFormOutfitId(dayEvent.outfitId || "");
    } else {
      setSelectedEvent(null);
      setFormTitle("");
      setFormDescription("");
      setFormStartTime("");
      setFormEndTime("");
      setFormOutfitId("");
    }
    
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!user?.id || !selectedDate) return;
    
    if (!formTitle.trim()) {
      Alert.alert("Error", "El título es requerido");
      return;
    }

    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, {
          title: formTitle,
          description: formDescription || undefined,
          startTime: formStartTime || undefined,
          endTime: formEndTime || undefined,
          outfitId: formOutfitId || undefined
        });
        Alert.alert("Éxito", "Evento actualizado");
      } else {
        await createEvent({
          userId: user.id,
          title: formTitle,
          description: formDescription || undefined,
          date: selectedDate,
          startTime: formStartTime || undefined,
          endTime: formEndTime || undefined,
          outfitId: formOutfitId || undefined
        });
        Alert.alert("Éxito", "Evento creado");
      }
      
      setModalVisible(false);
      loadEvents();
    } catch (error) {
      console.error("Error guardando evento:", error);
      Alert.alert("Error", "No se pudo guardar el evento");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (Platform.OS === 'web') {
      const confirm = window.confirm("¿Eliminar este evento?");
      if (confirm) {
        try {
          await deleteEvent(selectedEvent.id);
          Alert.alert("Éxito", "Evento eliminado");
          setModalVisible(false);
          loadEvents();
        } catch (error) {
          console.error("Error eliminando evento:", error);
          Alert.alert("Error", "No se pudo eliminar el evento");
        }
      }
    } else {
      Alert.alert(
        "Eliminar evento",
        "¿Estás seguro?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteEvent(selectedEvent.id);
                Alert.alert("Éxito", "Evento eliminado");
                setModalVisible(false);
                loadEvents();
              } catch (error) {
                console.error("Error eliminando evento:", error);
                Alert.alert("Error", "No se pudo eliminar el evento");
              }
            }
          }
        ]
      );
    }
  };

  // Obtener el outfit del día seleccionado
  const selectedDayOutfit = selectedDay !== null ? days[selectedDay]?.hasOutfit : false;
  
  // Buscar evento del día seleccionado
  const getSelectedDayEvent = () => {
    if (selectedDay === null) return null;
    const dayData = days[selectedDay];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return events.find(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === parseInt(dayData.num) &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year;
    });
  };

  const selectedDayEvent = getSelectedDayEvent();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Planificador</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs de navegación (Calendario / Mis Viajes) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Calendario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Mis Viajes</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de mes */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
          <Ionicons name="chevron-back" size={20} color={colors.gray} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>
      </View>

      {/* Días de la semana - Estilo exacto como en el diseño */}
      <View style={styles.daysRow}>
        {days.map((d) => {
          const isActive = selectedDay === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              onPress={() => handleDayPress(d.id, d.num)}
              style={[
                styles.dayCard,
                isActive && styles.dayCardActive,
                { backgroundColor: isActive ? colors.text : colors.surface }
              ]}
            >
              <Text style={[
                styles.dayName,
                isActive && styles.dayTextActive
              ]}>
                {d.day}
              </Text>
              <Text style={[
                styles.dayNumber,
                isActive && styles.dayTextActive
              ]}>
                {d.num}
              </Text>
              {d.hasOutfit && (
                <View style={[
                  styles.dayDot,
                  { backgroundColor: isActive ? colors.cta : colors.primary }
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Título del outfit del día */}
      <View style={styles.outfitHeader}>
        <Text style={styles.outfitTitle}>
          Tu Outfit • {selectedDay !== null ? `${days[selectedDay].day} ${days[selectedDay].num}` : ''}
        </Text>
      </View>

      {/* Card del outfit del día */}
      {selectedDayOutfit ? (
        <View style={styles.outfitCard}>
          <Image
            source={{ uri: selectedDayEvent?.outfit?.items[0]?.prenda?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' }}
            style={styles.outfitImage}
          />
          <View style={styles.outfitOverlay}>
            <View style={styles.outfitInfo}>
              <Text style={styles.outfitName}>
                {selectedDayEvent?.title || 'Urban Chic'}
              </Text>
              <View style={styles.outfitWeather}>
                <Ionicons name="thermometer-outline" size={12} color="white" />
                <Text style={styles.outfitWeatherText}>24°C Soleado</Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.emptyOutfitCard}
          onPress={() => selectedDay !== null && setModalVisible(true)}
        >
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Añadir Outfit</Text>
          <Text style={styles.emptySubtitle}>
            Selecciona de tus guardados o usa el generador.
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal para crear/editar evento */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedEvent ? 'Editar evento' : 'Nuevo evento'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDate}>{selectedDate}</Text>

            <TextInput
              style={styles.input}
              placeholder="Título del evento"
              placeholderTextColor="#999"
              value={formTitle}
              onChangeText={setFormTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor="#999"
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.timeRow}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={formStartTime}
                onChangeText={setFormStartTime}
              />
              <Text style={styles.timeSeparator}>-</Text>
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={formEndTime}
                onChangeText={setFormEndTime}
              />
            </View>

            <View style={styles.outfitSelector}>
              <Text style={styles.label}>Outfit sugerido:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.outfitOption,
                    !formOutfitId && styles.outfitOptionSelected
                  ]}
                  onPress={() => setFormOutfitId("")}
                >
                  <Text style={!formOutfitId ? styles.outfitOptionTextSelected : styles.outfitOptionText}>
                    Sin outfit
                  </Text>
                </TouchableOpacity>
                
                {userOutfits.map(outfit => (
                  <TouchableOpacity
                    key={outfit.id}
                    style={[
                      styles.outfitOption,
                      formOutfitId === outfit.id && styles.outfitOptionSelected
                    ]}
                    onPress={() => setFormOutfitId(outfit.id)}
                  >
                    <Text style={formOutfitId === outfit.id ? styles.outfitOptionTextSelected : styles.outfitOptionText}>
                      {outfit.name || 'Outfit'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              {selectedEvent && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteEvent}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveEvent}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: colors.text,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  monthButton: {
    padding: 4,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  dayCard: {
    width: 52,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  dayCardActive: {
    borderColor: colors.text,
    transform: [{ scale: 1.1 }, { translateY: -4 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  dayTextActive: {
    color: colors.surface,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  outfitHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  outfitCard: {
    height: 240,
    marginHorizontal: 16,
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  outfitOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  outfitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outfitName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
  },
  outfitWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outfitWeatherText: {
    fontSize: 12,
    color: colors.surface,
    opacity: 0.8,
  },
  emptyOutfitCard: {
    height: 240,
    marginHorizontal: 16,
    borderRadius: 32,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.gray,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    marginBottom: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: colors.gray,
  },
  outfitSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  outfitOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray,
    marginRight: 10,
  },
  outfitOptionSelected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  outfitOptionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  outfitOptionTextSelected: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.cta,
  },
  saveButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cta,
  },
  deleteButtonText: {
    color: colors.cta,
    fontWeight: '600',
  },
});