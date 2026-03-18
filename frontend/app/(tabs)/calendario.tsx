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
  Image,
  Platform,
  FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/auth";
import { 
  getUserEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  CalendarEvent 
} from "../../src/services/calendar.service";
import { getUserOutfits } from "../../src/services/outfits.service";

// --- PALETA DE COLORES (consistente con el proyecto) ---
const colors = {
  bg: '#FFFFFF',
  text: '#1E232A',
  primary: '#667eea', // Azul del proyecto
  secondary: '#40a585ff', // Verde del proyecto
  cta: '#E07A5F',
  surface: '#FFFFFF',
  gray: '#D5D1C9',
  lightGray: '#f5f5f5',
  border: '#ddd',
};

// Tipo para diferenciar entre evento normal y viaje
type CalendarItemType = 'event' | 'trip';

// Generar días del mes
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  const startDay = firstDay.getDay(); // 0 = domingo
  
  // Ajustar para que la semana empiece en lunes (1 = lunes)
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
  // Añadir días vacíos al inicio
  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(null);
  }
  
  // Añadir días del mes
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(year, month, i);
    days.push({
      date: currentDate,
      dayNumber: i,
      isToday: currentDate.toDateString() === new Date().toDateString()
    });
  }
  
  return days;
};

// Selector de hora
const TimePickerModal = ({ visible, onClose, onSelect, currentTime = '' }) => {
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  useEffect(() => {
    if (currentTime) {
      const [time, period] = currentTime.split(' ');
      const [hour, minute] = time.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period || 'AM');
    }
  }, [currentTime]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const handleConfirm = () => {
    onSelect(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
          
          <View style={styles.timePickerContainer}>
            {/* Horas */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hora</Text>
              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                {hours.map(hour => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.pickerItemSelected
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedHour === hour && styles.pickerItemTextSelected
                    ]}>{hour}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minutos */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minuto</Text>
              <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                {minutes.map(minute => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.pickerItemSelected
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedMinute === minute && styles.pickerItemTextSelected
                    ]}>{minute}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AM/PM */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Periodo</Text>
              {['AM', 'PM'].map(period => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonSelected
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    selectedPeriod === period && styles.periodButtonTextSelected
                  ]}>{period}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerButtons}>
            <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonCancel]} onPress={onClose}>
              <Text style={styles.pickerButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonConfirm]} onPress={handleConfirm}>
              <Text style={styles.pickerButtonTextConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Selector de fecha (mini calendario)
const DatePickerModal = ({ visible, onClose, onSelect, currentDate = '' }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (currentDate) {
      setSelectedDate(new Date(currentDate));
      setCurrentMonth(new Date(currentDate));
    }
  }, [currentDate]);

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDay = firstDay.getDay();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    onSelect(selectedDate.toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>
          
          {/* Selector de mes */}
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.datePickerMonth}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Días de la semana */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          {/* Días del mes */}
          <View style={styles.daysGrid}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.datePickerDay,
                  date && isSelectedDate(date) && styles.datePickerDaySelected
                ]}
                onPress={() => date && handleSelectDate(date)}
                disabled={!date}
              >
                {date && (
                  <Text style={[
                    styles.datePickerDayText,
                    isSelectedDate(date) && styles.datePickerDayTextSelected
                  ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.pickerButtons}>
            <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonCancel]} onPress={onClose}>
              <Text style={styles.pickerButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonConfirm]} onPress={handleConfirm}>
              <Text style={styles.pickerButtonTextConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function CalendarioScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [trips, setTrips] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<CalendarItemType>('event');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [userOutfits, setUserOutfits] = useState<any[]>([]);
  
  // Pickers
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formOutfitId, setFormOutfitId] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  // Meses en español
  const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  // Actualizar días del calendario cuando cambia el mes
  useEffect(() => {
    setCalendarDays(getDaysInMonth(currentMonth));
  }, [currentMonth]);

  // Cargar datos
  useEffect(() => {
    if (user?.id) {
      loadEvents();
      loadTrips();
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
      const normalEvents = data.filter(e => !(e as any).isTrip);
      setEvents(normalEvents);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserEvents(user.id);
      const tripsData = data.filter(e => (e as any).isTrip);
      setTrips(tripsData);
    } catch (error) {
      console.error("Error cargando viajes:", error);
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

  const handleAddEvent = () => {
    setModalType('event');
    setSelectedEvent(null);
    setFormTitle("");
    setFormDescription("");
    setFormStartTime("");
    setFormEndTime("");
    setFormOutfitId("");
    setModalVisible(true);
  };

  const handleAddTrip = () => {
    setModalType('trip');
    setSelectedEvent(null);
    setFormTitle("");
    setFormDescription("");
    setFormDestination("");
    setFormStartDate("");
    setFormEndDate("");
    setFormOutfitId("");
    setModalVisible(true);
  };

  const handleDayPress = (dayData: any) => {
    if (!dayData) return;
    
    setSelectedDay(dayData.dayNumber);
    const dateStr = dayData.date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    
    // Buscar evento para ese día
    const dayEvent = events.find(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === dayData.dayNumber &&
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
    
    if (dayEvent) {
      setSelectedEvent(dayEvent);
      setFormTitle(dayEvent.title);
      setFormDescription(dayEvent.description || "");
      setFormStartTime(dayEvent.startTime || "");
      setFormEndTime(dayEvent.endTime || "");
      setFormOutfitId(dayEvent.outfitId || "");
      setModalType('event');
    } else {
      setSelectedEvent(null);
      setFormTitle("");
      setFormDescription("");
      setFormStartTime("");
      setFormEndTime("");
      setFormOutfitId("");
      setModalType('event');
    }
    
    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!user?.id) return;
    
    if (modalType === 'event') {
      if (!formTitle.trim() || !selectedDate) {
        Alert.alert("Error", "El título y la fecha son requeridos");
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
            outfitId: formOutfitId || undefined,
            isTrip: false
          });
          Alert.alert("Éxito", "Evento creado");
        }
        
        setModalVisible(false);
        loadEvents();
      } catch (error) {
        console.error("Error guardando evento:", error);
        Alert.alert("Error", "No se pudo guardar el evento");
      }
    } else {
      if (!formTitle.trim() || !formDestination.trim() || !formStartDate || !formEndDate) {
        Alert.alert("Error", "Todos los campos son requeridos para el viaje");
        return;
      }

      try {
        if (selectedEvent) {
          await updateEvent(selectedEvent.id, {
            title: formTitle,
            description: formDescription || undefined,
            destination: formDestination,
            startDate: formStartDate,
            endDate: formEndDate,
            outfitId: formOutfitId || undefined,
            isTrip: true
          });
          Alert.alert("Éxito", "Viaje actualizado");
        } else {
          await createEvent({
            userId: user.id,
            title: formTitle,
            description: formDescription || undefined,
            destination: formDestination,
            startDate: formStartDate,
            endDate: formEndDate,
            outfitId: formOutfitId || undefined,
            isTrip: true
          });
          Alert.alert("Éxito", "Viaje creado");
        }
        
        setModalVisible(false);
        loadTrips();
      } catch (error) {
        console.error("Error guardando viaje:", error);
        Alert.alert("Error", "No se pudo guardar el viaje");
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    if (Platform.OS === 'web') {
      const confirm = window.confirm("¿Eliminar este elemento?");
      if (confirm) {
        try {
          await deleteEvent(selectedEvent.id);
          Alert.alert("Éxito", "Elemento eliminado");
          setModalVisible(false);
          if (modalType === 'event') {
            loadEvents();
          } else {
            loadTrips();
          }
        } catch (error) {
          console.error("Error eliminando:", error);
          Alert.alert("Error", "No se pudo eliminar");
        }
      }
    } else {
      Alert.alert(
        "Eliminar",
        "¿Estás seguro?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteEvent(selectedEvent.id);
                Alert.alert("Éxito", "Elemento eliminado");
                setModalVisible(false);
                if (modalType === 'event') {
                  loadEvents();
                } else {
                  loadTrips();
                }
              } catch (error) {
                console.error("Error eliminando:", error);
                Alert.alert("Error", "No se pudo eliminar");
              }
            }
          }
        ]
      );
    }
  };

  // Obtener eventos del día seleccionado
  const getSelectedDayEvents = () => {
    if (selectedDay === null) return [];
    
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === selectedDay &&
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planificador</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'calendar' && styles.tabActive]}
          onPress={() => setActiveTab('calendar')}
        >
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
            Calendario
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'trips' && styles.tabActive]}
          onPress={() => setActiveTab('trips')}
        >
          <Text style={[styles.tabText, activeTab === 'trips' && styles.tabTextActive]}>
            Mis Viajes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botones flotantes */}
      {activeTab === 'calendar' && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAddEvent}>
          <Ionicons name="calendar-outline" size={20} color="white" />
          <Text style={styles.fabText}>Nuevo Evento</Text>
        </TouchableOpacity>
      )}
      
      {activeTab === 'trips' && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.secondary }]} onPress={handleAddTrip}>
          <Ionicons name="airplane-outline" size={20} color="white" />
          <Text style={styles.fabText}>Nuevo Viaje</Text>
        </TouchableOpacity>
      )}

      {activeTab === 'calendar' ? (
        /* ========== VISTA CALENDARIO ========== */
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Selector de mes */}
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Días de la semana */}
          <View style={styles.weekDaysRow}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          {/* Calendario completo - SIN PUNTITOS AZULES */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((dayData, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  dayData?.isToday && styles.todayDay,
                  selectedDay === dayData?.dayNumber && styles.selectedDay
                ]}
                onPress={() => handleDayPress(dayData)}
                disabled={!dayData}
              >
                {dayData && (
                  <Text style={[
                    styles.calendarDayText,
                    dayData.isToday && styles.todayDayText,
                    selectedDay === dayData.dayNumber && styles.selectedDayText
                  ]}>
                    {dayData.dayNumber}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Eventos del día */}
          <View style={styles.eventsContainer}>
            <Text style={styles.sectionTitle}>
              Eventos {selectedDay ? `• ${selectedDay}` : ''}
            </Text>
            
            {selectedDay !== null ? (
              getSelectedDayEvents().length > 0 ? (
                getSelectedDayEvents().map(event => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => {
                      setSelectedEvent(event);
                      setFormTitle(event.title);
                      setFormDescription(event.description || "");
                      setFormStartTime(event.startTime || "");
                      setFormEndTime(event.endTime || "");
                      setFormOutfitId(event.outfitId || "");
                      setModalType('event');
                      setModalVisible(true);
                    }}
                  >
                    <View style={styles.eventTimeBadge}>
                      <Text style={styles.eventTimeText}>
                        {event.startTime || 'Todo el día'}
                      </Text>
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={40} color={colors.gray} />
                  <Text style={styles.emptyText}>No hay eventos para este día</Text>
                  <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleAddEvent}>
                    <Text style={styles.emptyButtonText}>Agregar Evento</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color={colors.gray} />
                <Text style={styles.emptyText}>Selecciona un día para ver sus eventos</Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        /* ========== VISTA VIAJES ========== */
        <ScrollView showsVerticalScrollIndicator={false} style={styles.tripsContainer}>
          {trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="airplane-outline" size={40} color={colors.gray} />
              <Text style={styles.emptyText}>No tienes viajes planificados</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.secondary }]} onPress={handleAddTrip}>
                <Text style={styles.emptyButtonText}>Planificar Viaje</Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.map(trip => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => {
                  setSelectedEvent(trip);
                  setFormTitle(trip.title);
                  setFormDescription(trip.description || "");
                  setFormDestination((trip as any).destination || "");
                  setFormStartDate((trip as any).startDate || "");
                  setFormEndDate((trip as any).endDate || "");
                  setFormOutfitId(trip.outfitId || "");
                  setModalType('trip');
                  setModalVisible(true);
                }}
              >
                <View style={styles.tripHeader}>
                  <View style={[styles.tripBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.tripBadgeText}>
                      {(trip as any).startDate && (trip as any).endDate ? 
                        `${(trip as any).startDate} - ${(trip as any).endDate}` : 
                        'Próximamente'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                {(trip as any).destination && (
                  <View style={styles.tripDetailItem}>
                    <Ionicons name="location-outline" size={14} color={colors.secondary} />
                    <Text style={styles.tripDetailText}>{(trip as any).destination}</Text>
                  </View>
                )}
                {trip.description && (
                  <Text style={styles.tripDescription}>{trip.description}</Text>
                )}
                {trip.outfitId && (
                  <View style={styles.tripOutfit}>
                    <Ionicons name="shirt-outline" size={14} color={colors.primary} />
                    <Text style={styles.tripOutfitText}>Outfit asignado</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal para crear/editar evento o viaje */}
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
                {selectedEvent 
                  ? (modalType === 'event' ? 'Editar Evento' : 'Editar Viaje')
                  : (modalType === 'event' ? 'Nuevo Evento' : 'Nuevo Viaje')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {modalType === 'event' ? (
              /* Formulario para evento normal */
              <>
                {/* Selector de fecha */}
                <TouchableOpacity 
                  style={styles.dateSelector}
                  onPress={() => setShowEventDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                  <Text style={styles.dateSelectorText}>
                    {selectedDate || 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>

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
                  {/* Hora inicio */}
                  <TouchableOpacity 
                    style={[styles.input, styles.timeInput]}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={formStartTime ? styles.timeText : styles.timePlaceholder}>
                      {formStartTime || 'HH:MM'}
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.timeSeparator}>-</Text>
                  
                  {/* Hora fin */}
                  <TouchableOpacity 
                    style={[styles.input, styles.timeInput]}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={formEndTime ? styles.timeText : styles.timePlaceholder}>
                      {formEndTime || 'HH:MM'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.outfitSelector}>
                  <Text style={styles.label}>Outfit sugerido:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[
                        styles.outfitOption,
                        !formOutfitId && { backgroundColor: colors.primary, borderColor: colors.primary }
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
                          formOutfitId === outfit.id && { backgroundColor: colors.primary, borderColor: colors.primary }
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
              </>
            ) : (
              /* Formulario para viaje */
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del viaje"
                  placeholderTextColor="#999"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Destino"
                  placeholderTextColor="#999"
                  value={formDestination}
                  onChangeText={setFormDestination}
                />

                <View style={styles.dateRangeRow}>
                  {/* Fecha inicio */}
                  <TouchableOpacity 
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={formStartDate ? styles.timeText : styles.timePlaceholder}>
                      {formStartDate || 'Inicio'}
                    </Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.dateSeparator}>a</Text>
                  
                  {/* Fecha fin */}
                  <TouchableOpacity 
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={formEndDate ? styles.timeText : styles.timePlaceholder}>
                      {formEndDate || 'Fin'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del viaje (opcional)"
                  placeholderTextColor="#999"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.outfitSelector}>
                  <Text style={styles.label}>Outfit sugerido para el viaje:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[
                        styles.outfitOption,
                        !formOutfitId && { backgroundColor: colors.primary, borderColor: colors.primary }
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
                          formOutfitId === outfit.id && { backgroundColor: colors.primary, borderColor: colors.primary }
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
              </>
            )}

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
                style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEvent}
              >
                <Text style={styles.saveButtonText}>
                  {selectedEvent ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pickers */}
      <TimePickerModal
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        onSelect={(time) => setFormStartTime(time)}
        currentTime={formStartTime}
      />

      <TimePickerModal
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        onSelect={(time) => setFormEndTime(time)}
        currentTime={formEndTime}
      />

      <DatePickerModal
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onSelect={(date) => setFormStartDate(date)}
        currentDate={formStartDate}
      />

      <DatePickerModal
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onSelect={(date) => setFormEndDate(date)}
        currentDate={formEndDate}
      />

      <DatePickerModal
        visible={showEventDatePicker}
        onClose={() => setShowEventDatePicker(false)}
        onSelect={(date) => setSelectedDate(date)}
        currentDate={selectedDate || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
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
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: 16,
    color: colors.text,
  },
  todayDay: {
    backgroundColor: colors.lightGray,
    borderRadius: 25,
  },
  todayDayText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: 25,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  eventTimeBadge: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  eventTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tripsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  tripHeader: {
    marginBottom: 12,
  },
  tripBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tripBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  tripDetailText: {
    fontSize: 14,
    color: '#666',
  },
  tripDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  tripOutfit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    gap: 6,
  },
  tripOutfitText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  dateSelectorText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
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
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    color: colors.text,
  },
  timePlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  timeSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: colors.gray,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
    justifyContent: 'center',
  },
  dateSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
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
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
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
  // Estilos para los pickers
  pickerModal: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  pickerScroll: {
    maxHeight: 150,
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 16,
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    marginVertical: 4,
    width: '80%',
    alignItems: 'center',
  },
  periodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  periodButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  pickerButtonCancel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  pickerButtonConfirm: {
    backgroundColor: colors.primary,
  },
  pickerButtonTextCancel: {
    color: colors.text,
    fontWeight: '600',
  },
  pickerButtonTextConfirm: {
    color: 'white',
    fontWeight: '600',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  datePickerDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerDaySelected: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  datePickerDayText: {
    fontSize: 14,
    color: colors.text,
  },
  datePickerDayTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
});