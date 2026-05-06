// app/(tabs)/calendario.tsx
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Image,
//   Platform,
//   FlatList
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAuth } from "../../src/contexts/auth";
// import { 
//   getUserEvents, 
//   createEvent, 
//   updateEvent, 
//   deleteEvent,
//   CalendarEvent 
// } from "../../src/services/calendar.service";
// import { getUserOutfits } from "../../src/services/outfits.service";

// // --- PALETA DE COLORES (consistente con el proyecto) ---
// const colors = {
//   bg: '#FFFFFF',
//   text: '#1E232A',
//   primary: '#667eea', // Azul del proyecto
//   secondary: '#40a585ff', // Verde del proyecto
//   cta: '#E07A5F',
//   surface: '#FFFFFF',
//   gray: '#D5D1C9',
//   lightGray: '#f5f5f5',
//   border: '#ddd',
// };

// // Tipo para diferenciar entre evento normal y viaje
// type CalendarItemType = 'event' | 'trip';

// // Generar días del mes
// const getDaysInMonth = (date: Date) => {
//   const year = date.getFullYear();
//   const month = date.getMonth();
//   const firstDay = new Date(year, month, 1);
//   const lastDay = new Date(year, month + 1, 0);
  
//   const days = [];
//   const startDay = firstDay.getDay(); // 0 = domingo
  
//   // Ajustar para que la semana empiece en lunes (1 = lunes)
//   const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  
//   // Añadir días vacíos al inicio
//   for (let i = 0; i < adjustedStartDay; i++) {
//     days.push(null);
//   }
  
//   // Añadir días del mes
//   for (let i = 1; i <= lastDay.getDate(); i++) {
//     const currentDate = new Date(year, month, i);
//     days.push({
//       date: currentDate,
//       dayNumber: i,
//       isToday: currentDate.toDateString() === new Date().toDateString()
//     });
//   }
  
//   return days;
// };

// // Selector de hora
// const TimePickerModal = ({ visible, onClose, onSelect, currentTime = '' }) => {
//   const [selectedHour, setSelectedHour] = useState('12');
//   const [selectedMinute, setSelectedMinute] = useState('00');
//   const [selectedPeriod, setSelectedPeriod] = useState('AM');

//   useEffect(() => {
//     if (currentTime) {
//       const [time, period] = currentTime.split(' ');
//       const [hour, minute] = time.split(':');
//       setSelectedHour(hour);
//       setSelectedMinute(minute);
//       setSelectedPeriod(period || 'AM');
//     }
//   }, [currentTime]);

//   const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
//   const minutes = ['00', '15', '30', '45'];

//   const handleConfirm = () => {
//     onSelect(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
//     onClose();
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.modalOverlay}>
//         <View style={styles.pickerModal}>
//           <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
          
//           <View style={styles.timePickerContainer}>
//             {/* Horas */}
//             <View style={styles.pickerColumn}>
//               <Text style={styles.pickerLabel}>Hora</Text>
//               <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
//                 {hours.map(hour => (
//                   <TouchableOpacity
//                     key={hour}
//                     style={[
//                       styles.pickerItem,
//                       selectedHour === hour && styles.pickerItemSelected
//                     ]}
//                     onPress={() => setSelectedHour(hour)}
//                   >
//                     <Text style={[
//                       styles.pickerItemText,
//                       selectedHour === hour && styles.pickerItemTextSelected
//                     ]}>{hour}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>

//             {/* Minutos */}
//             <View style={styles.pickerColumn}>
//               <Text style={styles.pickerLabel}>Minuto</Text>
//               <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
//                 {minutes.map(minute => (
//                   <TouchableOpacity
//                     key={minute}
//                     style={[
//                       styles.pickerItem,
//                       selectedMinute === minute && styles.pickerItemSelected
//                     ]}
//                     onPress={() => setSelectedMinute(minute)}
//                   >
//                     <Text style={[
//                       styles.pickerItemText,
//                       selectedMinute === minute && styles.pickerItemTextSelected
//                     ]}>{minute}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>

//             {/* AM/PM */}
//             <View style={styles.pickerColumn}>
//               <Text style={styles.pickerLabel}>Periodo</Text>
//               {['AM', 'PM'].map(period => (
//                 <TouchableOpacity
//                   key={period}
//                   style={[
//                     styles.periodButton,
//                     selectedPeriod === period && styles.periodButtonSelected
//                   ]}
//                   onPress={() => setSelectedPeriod(period)}
//                 >
//                   <Text style={[
//                     styles.periodButtonText,
//                     selectedPeriod === period && styles.periodButtonTextSelected
//                   ]}>{period}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           <View style={styles.pickerButtons}>
//             <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonCancel]} onPress={onClose}>
//               <Text style={styles.pickerButtonTextCancel}>Cancelar</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonConfirm]} onPress={handleConfirm}>
//               <Text style={styles.pickerButtonTextConfirm}>Confirmar</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // Selector de fecha (mini calendario)
// const DatePickerModal = ({ visible, onClose, onSelect, currentDate = '' }) => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   useEffect(() => {
//     if (currentDate) {
//       setSelectedDate(new Date(currentDate));
//       setCurrentMonth(new Date(currentDate));
//     }
//   }, [currentDate]);

//   const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
//     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
//   const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

//   const getDaysInMonth = (date: Date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
    
//     const days = [];
//     const startDay = firstDay.getDay();
//     const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
//     for (let i = 0; i < adjustedStartDay; i++) {
//       days.push(null);
//     }
    
//     for (let i = 1; i <= lastDay.getDate(); i++) {
//       days.push(new Date(year, month, i));
//     }
    
//     return days;
//   };

//   const days = getDaysInMonth(currentMonth);

//   const handlePrevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
//   };

//   const isSelectedDate = (date: Date) => {
//     return date.toDateString() === selectedDate.toDateString();
//   };

//   const handleSelectDate = (date: Date) => {
//     setSelectedDate(date);
//   };

//   const handleConfirm = () => {
//     onSelect(selectedDate.toISOString().split('T')[0]);
//     onClose();
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.modalOverlay}>
//         <View style={styles.pickerModal}>
//           <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>
          
//           {/* Selector de mes */}
//           <View style={styles.datePickerHeader}>
//             <TouchableOpacity onPress={handlePrevMonth}>
//               <Ionicons name="chevron-back" size={24} color={colors.primary} />
//             </TouchableOpacity>
//             <Text style={styles.datePickerMonth}>
//               {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
//             </Text>
//             <TouchableOpacity onPress={handleNextMonth}>
//               <Ionicons name="chevron-forward" size={24} color={colors.primary} />
//             </TouchableOpacity>
//           </View>

//           {/* Días de la semana */}
//           <View style={styles.weekDaysRow}>
//             {weekDays.map((day, index) => (
//               <Text key={index} style={styles.weekDayText}>{day}</Text>
//             ))}
//           </View>

//           {/* Días del mes */}
//           <View style={styles.daysGrid}>
//             {days.map((date, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.datePickerDay,
//                   date && isSelectedDate(date) && styles.datePickerDaySelected
//                 ]}
//                 onPress={() => date && handleSelectDate(date)}
//                 disabled={!date}
//               >
//                 {date && (
//                   <Text style={[
//                     styles.datePickerDayText,
//                     isSelectedDate(date) && styles.datePickerDayTextSelected
//                   ]}>
//                     {date.getDate()}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={styles.pickerButtons}>
//             <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonCancel]} onPress={onClose}>
//               <Text style={styles.pickerButtonTextCancel}>Cancelar</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.pickerButton, styles.pickerButtonConfirm]} onPress={handleConfirm}>
//               <Text style={styles.pickerButtonTextConfirm}>Confirmar</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default function CalendarioScreen() {
//   const { user } = useAuth();
//   const [activeTab, setActiveTab] = useState('calendar');
//   const [selectedDay, setSelectedDay] = useState<number | null>(null);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [calendarDays, setCalendarDays] = useState<any[]>([]);
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [trips, setTrips] = useState<CalendarEvent[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState<CalendarItemType>('event');
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
//   const [userOutfits, setUserOutfits] = useState<any[]>([]);
  
//   // Pickers
//   const [showStartTimePicker, setShowStartTimePicker] = useState(false);
//   const [showEndTimePicker, setShowEndTimePicker] = useState(false);
//   const [showStartDatePicker, setShowStartDatePicker] = useState(false);
//   const [showEndDatePicker, setShowEndDatePicker] = useState(false);
//   const [showEventDatePicker, setShowEventDatePicker] = useState(false);

//   // Form state
//   const [formTitle, setFormTitle] = useState("");
//   const [formDescription, setFormDescription] = useState("");
//   const [formStartTime, setFormStartTime] = useState("");
//   const [formEndTime, setFormEndTime] = useState("");
//   const [formOutfitId, setFormOutfitId] = useState("");
//   const [formDestination, setFormDestination] = useState("");
//   const [formStartDate, setFormStartDate] = useState("");
//   const [formEndDate, setFormEndDate] = useState("");

//   // Meses en español
//   const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
//     'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

//   // Actualizar días del calendario cuando cambia el mes
//   useEffect(() => {
//     setCalendarDays(getDaysInMonth(currentMonth));
//   }, [currentMonth]);

//   // Cargar datos
//   useEffect(() => {
//     if (user?.id) {
//       loadEvents();
//       loadTrips();
//       loadOutfits();
//     }
//   }, [user?.id, currentMonth]);

//   const loadEvents = async () => {
//     if (!user?.id) return;
//     setLoading(true);
//     try {
//       const month = currentMonth.getMonth() + 1;
//       const year = currentMonth.getFullYear();
//       const data = await getUserEvents(user.id, month, year);
//       const normalEvents = data.filter(e => !(e as any).isTrip);
//       setEvents(normalEvents);
//     } catch (error) {
//       console.error("Error cargando eventos:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadTrips = async () => {
//     if (!user?.id) return;
//     try {
//       const data = await getUserEvents(user.id);
//       const tripsData = data.filter(e => (e as any).isTrip);
//       setTrips(tripsData);
//     } catch (error) {
//       console.error("Error cargando viajes:", error);
//     }
//   };

//   const loadOutfits = async () => {
//     if (!user?.id) return;
//     try {
//       const data = await getUserOutfits(user.id);
//       setUserOutfits(data);
//     } catch (error) {
//       console.error("Error cargando outfits:", error);
//     }
//   };

//   const handlePrevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
//   };

//   const handleAddEvent = () => {
//     setModalType('event');
//     setSelectedEvent(null);
//     setFormTitle("");
//     setFormDescription("");
//     setFormStartTime("");
//     setFormEndTime("");
//     setFormOutfitId("");
//     setModalVisible(true);
//   };

//   const handleAddTrip = () => {
//     setModalType('trip');
//     setSelectedEvent(null);
//     setFormTitle("");
//     setFormDescription("");
//     setFormDestination("");
//     setFormStartDate("");
//     setFormEndDate("");
//     setFormOutfitId("");
//     setModalVisible(true);
//   };

//   const handleDayPress = (dayData: any) => {
//     if (!dayData) return;
    
//     setSelectedDay(dayData.dayNumber);
//     const dateStr = dayData.date.toISOString().split('T')[0];
//     setSelectedDate(dateStr);
    
//     // Buscar evento para ese día
//     const dayEvent = events.find(e => {
//       const eventDate = new Date(e.date);
//       return eventDate.getDate() === dayData.dayNumber &&
//              eventDate.getMonth() === currentMonth.getMonth() &&
//              eventDate.getFullYear() === currentMonth.getFullYear();
//     });
    
//     if (dayEvent) {
//       setSelectedEvent(dayEvent);
//       setFormTitle(dayEvent.title);
//       setFormDescription(dayEvent.description || "");
//       setFormStartTime(dayEvent.startTime || "");
//       setFormEndTime(dayEvent.endTime || "");
//       setFormOutfitId(dayEvent.outfitId || "");
//       setModalType('event');
//     } else {
//       setSelectedEvent(null);
//       setFormTitle("");
//       setFormDescription("");
//       setFormStartTime("");
//       setFormEndTime("");
//       setFormOutfitId("");
//       setModalType('event');
//     }
    
//     setModalVisible(true);
//   };

//   const handleSaveEvent = async () => {
//     if (!user?.id) return;
    
//     if (modalType === 'event') {
//       if (!formTitle.trim() || !selectedDate) {
//         Alert.alert("Error", "El título y la fecha son requeridos");
//         return;
//       }

//       try {
//         if (selectedEvent) {
//           await updateEvent(selectedEvent.id, {
//             title: formTitle,
//             description: formDescription || undefined,
//             startTime: formStartTime || undefined,
//             endTime: formEndTime || undefined,
//             outfitId: formOutfitId || undefined
//           });
//           Alert.alert("Éxito", "Evento actualizado");
//         } else {
//           await createEvent({
//             userId: user.id,
//             title: formTitle,
//             description: formDescription || undefined,
//             date: selectedDate,
//             startTime: formStartTime || undefined,
//             endTime: formEndTime || undefined,
//             outfitId: formOutfitId || undefined,
//             isTrip: false
//           });
//           Alert.alert("Éxito", "Evento creado");
//         }
        
//         setModalVisible(false);
//         loadEvents();
//       } catch (error) {
//         console.error("Error guardando evento:", error);
//         Alert.alert("Error", "No se pudo guardar el evento");
//       }
//     } else {
//       if (!formTitle.trim() || !formDestination.trim() || !formStartDate || !formEndDate) {
//         Alert.alert("Error", "Todos los campos son requeridos para el viaje");
//         return;
//       }

//       try {
//         if (selectedEvent) {
//           await updateEvent(selectedEvent.id, {
//             title: formTitle,
//             description: formDescription || undefined,
//             destination: formDestination,
//             startDate: formStartDate,
//             endDate: formEndDate,
//             outfitId: formOutfitId || undefined,
//             isTrip: true
//           });
//           Alert.alert("Éxito", "Viaje actualizado");
//         } else {
//           await createEvent({
//             userId: user.id,
//             title: formTitle,
//             description: formDescription || undefined,
//             destination: formDestination,
//             startDate: formStartDate,
//             endDate: formEndDate,
//             outfitId: formOutfitId || undefined,
//             isTrip: true
//           });
//           Alert.alert("Éxito", "Viaje creado");
//         }
        
//         setModalVisible(false);
//         loadTrips();
//       } catch (error) {
//         console.error("Error guardando viaje:", error);
//         Alert.alert("Error", "No se pudo guardar el viaje");
//       }
//     }
//   };

//   const handleDeleteEvent = async () => {
//     if (!selectedEvent) return;
    
//     if (Platform.OS === 'web') {
//       const confirm = window.confirm("¿Eliminar este elemento?");
//       if (confirm) {
//         try {
//           await deleteEvent(selectedEvent.id);
//           Alert.alert("Éxito", "Elemento eliminado");
//           setModalVisible(false);
//           if (modalType === 'event') {
//             loadEvents();
//           } else {
//             loadTrips();
//           }
//         } catch (error) {
//           console.error("Error eliminando:", error);
//           Alert.alert("Error", "No se pudo eliminar");
//         }
//       }
//     } else {
//       Alert.alert(
//         "Eliminar",
//         "¿Estás seguro?",
//         [
//           { text: "Cancelar", style: "cancel" },
//           {
//             text: "Eliminar",
//             style: "destructive",
//             onPress: async () => {
//               try {
//                 await deleteEvent(selectedEvent.id);
//                 Alert.alert("Éxito", "Elemento eliminado");
//                 setModalVisible(false);
//                 if (modalType === 'event') {
//                   loadEvents();
//                 } else {
//                   loadTrips();
//                 }
//               } catch (error) {
//                 console.error("Error eliminando:", error);
//                 Alert.alert("Error", "No se pudo eliminar");
//               }
//             }
//           }
//         ]
//       );
//     }
//   };

//   // Obtener eventos del día seleccionado
//   const getSelectedDayEvents = () => {
//     if (selectedDay === null) return [];
    
//     return events.filter(e => {
//       const eventDate = new Date(e.date);
//       return eventDate.getDate() === selectedDay &&
//              eventDate.getMonth() === currentMonth.getMonth() &&
//              eventDate.getFullYear() === currentMonth.getFullYear();
//     });
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.bg }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Planificador</Text>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'calendar' && styles.tabActive]}
//           onPress={() => setActiveTab('calendar')}
//         >
//           <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
//             Calendario
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.tab, activeTab === 'trips' && styles.tabActive]}
//           onPress={() => setActiveTab('trips')}
//         >
//           <Text style={[styles.tabText, activeTab === 'trips' && styles.tabTextActive]}>
//             Mis Viajes
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Botones flotantes */}
//       {activeTab === 'calendar' && (
//         <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={handleAddEvent}>
//           <Ionicons name="calendar-outline" size={20} color="white" />
//           <Text style={styles.fabText}>Nuevo Evento</Text>
//         </TouchableOpacity>
//       )}
      
//       {activeTab === 'trips' && (
//         <TouchableOpacity style={[styles.fab, { backgroundColor: colors.secondary }]} onPress={handleAddTrip}>
//           <Ionicons name="airplane-outline" size={20} color="white" />
//           <Text style={styles.fabText}>Nuevo Viaje</Text>
//         </TouchableOpacity>
//       )}

//       {activeTab === 'calendar' ? (
//         /* ========== VISTA CALENDARIO ========== */
//         <ScrollView showsVerticalScrollIndicator={false}>
//           {/* Selector de mes */}
//           <View style={styles.monthSelector}>
//             <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
//               <Ionicons name="chevron-back" size={20} color={colors.primary} />
//             </TouchableOpacity>
//             <Text style={styles.monthText}>
//               {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
//             </Text>
//             <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
//               <Ionicons name="chevron-forward" size={20} color={colors.primary} />
//             </TouchableOpacity>
//           </View>

//           {/* Días de la semana */}
//           <View style={styles.weekDaysRow}>
//             {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
//               <Text key={index} style={styles.weekDayText}>{day}</Text>
//             ))}
//           </View>

//           {/* Calendario completo - SIN PUNTITOS AZULES */}
//           <View style={styles.calendarGrid}>
//             {calendarDays.map((dayData, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.calendarDay,
//                   dayData?.isToday && styles.todayDay,
//                   selectedDay === dayData?.dayNumber && styles.selectedDay
//                 ]}
//                 onPress={() => handleDayPress(dayData)}
//                 disabled={!dayData}
//               >
//                 {dayData && (
//                   <Text style={[
//                     styles.calendarDayText,
//                     dayData.isToday && styles.todayDayText,
//                     selectedDay === dayData.dayNumber && styles.selectedDayText
//                   ]}>
//                     {dayData.dayNumber}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Eventos del día */}
//           <View style={styles.eventsContainer}>
//             <Text style={styles.sectionTitle}>
//               Eventos {selectedDay ? `• ${selectedDay}` : ''}
//             </Text>
            
//             {selectedDay !== null ? (
//               getSelectedDayEvents().length > 0 ? (
//                 getSelectedDayEvents().map(event => (
//                   <TouchableOpacity
//                     key={event.id}
//                     style={styles.eventCard}
//                     onPress={() => {
//                       setSelectedEvent(event);
//                       setFormTitle(event.title);
//                       setFormDescription(event.description || "");
//                       setFormStartTime(event.startTime || "");
//                       setFormEndTime(event.endTime || "");
//                       setFormOutfitId(event.outfitId || "");
//                       setModalType('event');
//                       setModalVisible(true);
//                     }}
//                   >
//                     <View style={styles.eventTimeBadge}>
//                       <Text style={styles.eventTimeText}>
//                         {event.startTime || 'Todo el día'}
//                       </Text>
//                     </View>
//                     <View style={styles.eventContent}>
//                       <Text style={styles.eventTitle}>{event.title}</Text>
//                       {event.description && (
//                         <Text style={styles.eventDescription}>{event.description}</Text>
//                       )}
//                     </View>
//                     <Ionicons name="chevron-forward" size={20} color={colors.gray} />
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <View style={styles.emptyState}>
//                   <Ionicons name="calendar-outline" size={40} color={colors.gray} />
//                   <Text style={styles.emptyText}>No hay eventos para este día</Text>
//                   <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={handleAddEvent}>
//                     <Text style={styles.emptyButtonText}>Agregar Evento</Text>
//                   </TouchableOpacity>
//                 </View>
//               )
//             ) : (
//               <View style={styles.emptyState}>
//                 <Ionicons name="calendar-outline" size={40} color={colors.gray} />
//                 <Text style={styles.emptyText}>Selecciona un día para ver sus eventos</Text>
//               </View>
//             )}
//           </View>
//         </ScrollView>
//       ) : (
//         /* ========== VISTA VIAJES ========== */
//         <ScrollView showsVerticalScrollIndicator={false} style={styles.tripsContainer}>
//           {trips.length === 0 ? (
//             <View style={styles.emptyState}>
//               <Ionicons name="airplane-outline" size={40} color={colors.gray} />
//               <Text style={styles.emptyText}>No tienes viajes planificados</Text>
//               <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.secondary }]} onPress={handleAddTrip}>
//                 <Text style={styles.emptyButtonText}>Planificar Viaje</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             trips.map(trip => (
//               <TouchableOpacity
//                 key={trip.id}
//                 style={styles.tripCard}
//                 onPress={() => {
//                   setSelectedEvent(trip);
//                   setFormTitle(trip.title);
//                   setFormDescription(trip.description || "");
//                   setFormDestination((trip as any).destination || "");
//                   setFormStartDate((trip as any).startDate || "");
//                   setFormEndDate((trip as any).endDate || "");
//                   setFormOutfitId(trip.outfitId || "");
//                   setModalType('trip');
//                   setModalVisible(true);
//                 }}
//               >
//                 <View style={styles.tripHeader}>
//                   <View style={[styles.tripBadge, { backgroundColor: colors.secondary }]}>
//                     <Text style={styles.tripBadgeText}>
//                       {(trip as any).startDate && (trip as any).endDate ? 
//                         `${(trip as any).startDate} - ${(trip as any).endDate}` : 
//                         'Próximamente'}
//                     </Text>
//                   </View>
//                 </View>
//                 <Text style={styles.tripTitle}>{trip.title}</Text>
//                 {(trip as any).destination && (
//                   <View style={styles.tripDetailItem}>
//                     <Ionicons name="location-outline" size={14} color={colors.secondary} />
//                     <Text style={styles.tripDetailText}>{(trip as any).destination}</Text>
//                   </View>
//                 )}
//                 {trip.description && (
//                   <Text style={styles.tripDescription}>{trip.description}</Text>
//                 )}
//                 {trip.outfitId && (
//                   <View style={styles.tripOutfit}>
//                     <Ionicons name="shirt-outline" size={14} color={colors.primary} />
//                     <Text style={styles.tripOutfitText}>Outfit asignado</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))
//           )}
//         </ScrollView>
//       )}

//       {/* Modal para crear/editar evento o viaje */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {selectedEvent 
//                   ? (modalType === 'event' ? 'Editar Evento' : 'Editar Viaje')
//                   : (modalType === 'event' ? 'Nuevo Evento' : 'Nuevo Viaje')}
//               </Text>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={colors.text} />
//               </TouchableOpacity>
//             </View>

//             {modalType === 'event' ? (
//               /* Formulario para evento normal */
//               <>
//                 {/* Selector de fecha */}
//                 <TouchableOpacity 
//                   style={styles.dateSelector}
//                   onPress={() => setShowEventDatePicker(true)}
//                 >
//                   <Ionicons name="calendar-outline" size={20} color={colors.primary} />
//                   <Text style={styles.dateSelectorText}>
//                     {selectedDate || 'Seleccionar fecha'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TextInput
//                   style={styles.input}
//                   placeholder="Título del evento"
//                   placeholderTextColor="#999"
//                   value={formTitle}
//                   onChangeText={setFormTitle}
//                 />

//                 <TextInput
//                   style={[styles.input, styles.textArea]}
//                   placeholder="Descripción (opcional)"
//                   placeholderTextColor="#999"
//                   value={formDescription}
//                   onChangeText={setFormDescription}
//                   multiline
//                   numberOfLines={3}
//                 />

//                 <View style={styles.timeRow}>
//                   {/* Hora inicio */}
//                   <TouchableOpacity 
//                     style={[styles.input, styles.timeInput]}
//                     onPress={() => setShowStartTimePicker(true)}
//                   >
//                     <Text style={formStartTime ? styles.timeText : styles.timePlaceholder}>
//                       {formStartTime || 'HH:MM'}
//                     </Text>
//                   </TouchableOpacity>
                  
//                   <Text style={styles.timeSeparator}>-</Text>
                  
//                   {/* Hora fin */}
//                   <TouchableOpacity 
//                     style={[styles.input, styles.timeInput]}
//                     onPress={() => setShowEndTimePicker(true)}
//                   >
//                     <Text style={formEndTime ? styles.timeText : styles.timePlaceholder}>
//                       {formEndTime || 'HH:MM'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.outfitSelector}>
//                   <Text style={styles.label}>Outfit sugerido:</Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     <TouchableOpacity
//                       style={[
//                         styles.outfitOption,
//                         !formOutfitId && { backgroundColor: colors.primary, borderColor: colors.primary }
//                       ]}
//                       onPress={() => setFormOutfitId("")}
//                     >
//                       <Text style={!formOutfitId ? styles.outfitOptionTextSelected : styles.outfitOptionText}>
//                         Sin outfit
//                       </Text>
//                     </TouchableOpacity>
                    
//                     {userOutfits.map(outfit => (
//                       <TouchableOpacity
//                         key={outfit.id}
//                         style={[
//                           styles.outfitOption,
//                           formOutfitId === outfit.id && { backgroundColor: colors.primary, borderColor: colors.primary }
//                         ]}
//                         onPress={() => setFormOutfitId(outfit.id)}
//                       >
//                         <Text style={formOutfitId === outfit.id ? styles.outfitOptionTextSelected : styles.outfitOptionText}>
//                           {outfit.name || 'Outfit'}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>
//               </>
//             ) : (
//               /* Formulario para viaje */
//               <>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Nombre del viaje"
//                   placeholderTextColor="#999"
//                   value={formTitle}
//                   onChangeText={setFormTitle}
//                 />

//                 <TextInput
//                   style={styles.input}
//                   placeholder="Destino"
//                   placeholderTextColor="#999"
//                   value={formDestination}
//                   onChangeText={setFormDestination}
//                 />

//                 <View style={styles.dateRangeRow}>
//                   {/* Fecha inicio */}
//                   <TouchableOpacity 
//                     style={[styles.input, styles.dateInput]}
//                     onPress={() => setShowStartDatePicker(true)}
//                   >
//                     <Text style={formStartDate ? styles.timeText : styles.timePlaceholder}>
//                       {formStartDate || 'Inicio'}
//                     </Text>
//                   </TouchableOpacity>
                  
//                   <Text style={styles.dateSeparator}>a</Text>
                  
//                   {/* Fecha fin */}
//                   <TouchableOpacity 
//                     style={[styles.input, styles.dateInput]}
//                     onPress={() => setShowEndDatePicker(true)}
//                   >
//                     <Text style={formEndDate ? styles.timeText : styles.timePlaceholder}>
//                       {formEndDate || 'Fin'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 <TextInput
//                   style={[styles.input, styles.textArea]}
//                   placeholder="Descripción del viaje (opcional)"
//                   placeholderTextColor="#999"
//                   value={formDescription}
//                   onChangeText={setFormDescription}
//                   multiline
//                   numberOfLines={3}
//                 />

//                 <View style={styles.outfitSelector}>
//                   <Text style={styles.label}>Outfit sugerido para el viaje:</Text>
//                   <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     <TouchableOpacity
//                       style={[
//                         styles.outfitOption,
//                         !formOutfitId && { backgroundColor: colors.primary, borderColor: colors.primary }
//                       ]}
//                       onPress={() => setFormOutfitId("")}
//                     >
//                       <Text style={!formOutfitId ? styles.outfitOptionTextSelected : styles.outfitOptionText}>
//                         Sin outfit
//                       </Text>
//                     </TouchableOpacity>
                    
//                     {userOutfits.map(outfit => (
//                       <TouchableOpacity
//                         key={outfit.id}
//                         style={[
//                           styles.outfitOption,
//                           formOutfitId === outfit.id && { backgroundColor: colors.primary, borderColor: colors.primary }
//                         ]}
//                         onPress={() => setFormOutfitId(outfit.id)}
//                       >
//                         <Text style={formOutfitId === outfit.id ? styles.outfitOptionTextSelected : styles.outfitOptionText}>
//                           {outfit.name || 'Outfit'}
//                         </Text>
//                       </TouchableOpacity>
//                     ))}
//                   </ScrollView>
//                 </View>
//               </>
//             )}

//             <View style={styles.modalButtons}>
//               {selectedEvent && (
//                 <TouchableOpacity
//                   style={[styles.button, styles.deleteButton]}
//                   onPress={handleDeleteEvent}
//                 >
//                   <Text style={styles.deleteButtonText}>Eliminar</Text>
//                 </TouchableOpacity>
//               )}
              
//               <TouchableOpacity
//                 style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
//                 onPress={handleSaveEvent}
//               >
//                 <Text style={styles.saveButtonText}>
//                   {selectedEvent ? 'Actualizar' : 'Guardar'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Pickers */}
//       <TimePickerModal
//         visible={showStartTimePicker}
//         onClose={() => setShowStartTimePicker(false)}
//         onSelect={(time) => setFormStartTime(time)}
//         currentTime={formStartTime}
//       />

//       <TimePickerModal
//         visible={showEndTimePicker}
//         onClose={() => setShowEndTimePicker(false)}
//         onSelect={(time) => setFormEndTime(time)}
//         currentTime={formEndTime}
//       />

//       <DatePickerModal
//         visible={showStartDatePicker}
//         onClose={() => setShowStartDatePicker(false)}
//         onSelect={(date) => setFormStartDate(date)}
//         currentDate={formStartDate}
//       />

//       <DatePickerModal
//         visible={showEndDatePicker}
//         onClose={() => setShowEndDatePicker(false)}
//         onSelect={(date) => setFormEndDate(date)}
//         currentDate={formEndDate}
//       />

//       <DatePickerModal
//         visible={showEventDatePicker}
//         onClose={() => setShowEventDatePicker(false)}
//         onSelect={(date) => setSelectedDate(date)}
//         currentDate={selectedDate || undefined}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 10,
//     backgroundColor: colors.surface,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: colors.text,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: colors.bg,
//     padding: 6,
//     marginHorizontal: 16,
//     marginTop: 8,
//     marginBottom: 16,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: 'rgba(0,0,0,0.1)',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 12,
//   },
//   tabActive: {
//     backgroundColor: colors.surface,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#999',
//   },
//   tabTextActive: {
//     color: colors.text,
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     zIndex: 10,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   fabText: {
//     color: 'white',
//     fontWeight: '600',
//     marginLeft: 8,
//     fontSize: 14,
//   },
//   monthSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: colors.surface,
//     marginHorizontal: 16,
//     marginTop: 8,
//     marginBottom: 20,
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: colors.gray,
//   },
//   monthButton: {
//     padding: 4,
//   },
//   monthText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text,
//     letterSpacing: 0.5,
//   },
//   weekDaysRow: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     marginBottom: 8,
//   },
//   weekDayText: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#999',
//     textTransform: 'uppercase',
//   },
//   calendarGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingHorizontal: 12,
//     marginBottom: 24,
//   },
//   calendarDay: {
//     width: '14.28%',
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   calendarDayText: {
//     fontSize: 16,
//     color: colors.text,
//   },
//   todayDay: {
//     backgroundColor: colors.lightGray,
//     borderRadius: 25,
//   },
//   todayDayText: {
//     fontWeight: 'bold',
//     color: colors.primary,
//   },
//   selectedDay: {
//     backgroundColor: colors.primary,
//     borderRadius: 25,
//   },
//   selectedDayText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   eventsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingBottom: 100,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: colors.text,
//     marginBottom: 16,
//   },
//   eventCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.surface,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: colors.gray,
//   },
//   eventTimeBadge: {
//     backgroundColor: colors.lightGray,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginRight: 12,
//   },
//   eventTimeText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   eventContent: {
//     flex: 1,
//   },
//   eventTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//     marginBottom: 4,
//   },
//   eventDescription: {
//     fontSize: 14,
//     color: '#999',
//   },
//   emptyState: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#999',
//     marginTop: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   emptyButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 30,
//   },
//   emptyButtonText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   tripsContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingBottom: 100,
//   },
//   tripCard: {
//     backgroundColor: colors.surface,
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: colors.gray,
//   },
//   tripHeader: {
//     marginBottom: 12,
//   },
//   tripBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 20,
//     alignSelf: 'flex-start',
//   },
//   tripBadgeText: {
//     color: colors.surface,
//     fontSize: 10,
//     fontWeight: '700',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   tripTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: colors.text,
//     marginBottom: 8,
//   },
//   tripDetailItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//     gap: 6,
//   },
//   tripDetailText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   tripDescription: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 8,
//     lineHeight: 20,
//   },
//   tripOutfit: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: colors.gray,
//     gap: 6,
//   },
//   tripOutfitText: {
//     fontSize: 14,
//     color: colors.primary,
//     fontWeight: '600',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '90%',
//     backgroundColor: colors.surface,
//     borderRadius: 32,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: colors.text,
//   },
//   dateSelector: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: colors.gray,
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 16,
//     gap: 10,
//   },
//   dateSelectorText: {
//     fontSize: 14,
//     color: colors.text,
//     flex: 1,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.gray,
//     borderRadius: 16,
//     padding: 14,
//     fontSize: 14,
//     marginBottom: 16,
//     color: colors.text,
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: 'top',
//   },
//   timeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   timeInput: {
//     flex: 1,
//     marginBottom: 0,
//     justifyContent: 'center',
//   },
//   timeText: {
//     fontSize: 14,
//     color: colors.text,
//   },
//   timePlaceholder: {
//     fontSize: 14,
//     color: '#999',
//   },
//   timeSeparator: {
//     marginHorizontal: 12,
//     fontSize: 16,
//     color: colors.gray,
//   },
//   dateRangeRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   dateInput: {
//     flex: 1,
//     marginBottom: 0,
//     justifyContent: 'center',
//   },
//   dateSeparator: {
//     marginHorizontal: 12,
//     fontSize: 14,
//     color: colors.gray,
//   },
//   outfitSelector: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     color: colors.text,
//     marginBottom: 12,
//     fontWeight: '500',
//   },
//   outfitOption: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: colors.gray,
//     marginRight: 10,
//   },
//   outfitOptionText: {
//     color: colors.text,
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   outfitOptionTextSelected: {
//     color: colors.surface,
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 12,
//     marginTop: 8,
//   },
//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 16,
//     minWidth: 100,
//     alignItems: 'center',
//   },
//   saveButton: {
//     backgroundColor: colors.primary,
//   },
//   saveButtonText: {
//     color: colors.surface,
//     fontWeight: '600',
//   },
//   deleteButton: {
//     backgroundColor: colors.surface,
//     borderWidth: 1,
//     borderColor: colors.cta,
//   },
//   deleteButtonText: {
//     color: colors.cta,
//     fontWeight: '600',
//   },
//   // Estilos para los pickers
//   pickerModal: {
//     width: '80%',
//     backgroundColor: colors.surface,
//     borderRadius: 24,
//     padding: 20,
//     maxHeight: '70%',
//   },
//   pickerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.text,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   timePickerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   pickerColumn: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   pickerLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text,
//     marginBottom: 10,
//   },
//   pickerScroll: {
//     maxHeight: 150,
//     width: '100%',
//   },
//   pickerItem: {
//     paddingVertical: 8,
//     alignItems: 'center',
//   },
//   pickerItemSelected: {
//     backgroundColor: colors.primary,
//     borderRadius: 8,
//   },
//   pickerItemText: {
//     fontSize: 16,
//     color: colors.text,
//   },
//   pickerItemTextSelected: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   periodButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderWidth: 1,
//     borderColor: colors.gray,
//     borderRadius: 8,
//     marginVertical: 4,
//     width: '80%',
//     alignItems: 'center',
//   },
//   periodButtonSelected: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   periodButtonText: {
//     fontSize: 16,
//     color: colors.text,
//   },
//   periodButtonTextSelected: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   pickerButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 20,
//   },
//   pickerButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 20,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   pickerButtonCancel: {
//     backgroundColor: colors.surface,
//     borderWidth: 1,
//     borderColor: colors.gray,
//   },
//   pickerButtonConfirm: {
//     backgroundColor: colors.primary,
//   },
//   pickerButtonTextCancel: {
//     color: colors.text,
//     fontWeight: '600',
//   },
//   pickerButtonTextConfirm: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   datePickerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   datePickerMonth: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   daysGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 20,
//   },
//   datePickerDay: {
//     width: '14.28%',
//     aspectRatio: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   datePickerDaySelected: {
//     backgroundColor: colors.primary,
//     borderRadius: 20,
//   },
//   datePickerDayText: {
//     fontSize: 14,
//     color: colors.text,
//   },
//   datePickerDayTextSelected: {
//     color: 'white',
//     fontWeight: '600',
//   },
// });

// frontend/app/(tabs)/calendario.tsx

// frontend/app/(tabs)/calendario.tsx

import React, { useCallback, useEffect, useState } from "react";
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
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";

import { useAuth } from "../../src/contexts/auth";
import {
  getUserEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  CalendarEvent,
} from "../../src/services/calendar.service";
import { getUserOutfits } from "../../src/services/outfits.service";
import { getUserClothes, Prenda } from "../../src/services/clothingServie";

const palette = {
  bg: "#EEF3F7",
  card: "#FFFFFF",
  text: "#1F2A44",
  muted: "#6B7280",
  lightMuted: "#9CA3AF",
  border: "#E5E7EB",
  primary: "#4A6FA5",
  secondary: "#8FB8A8",
  accent: "#A78BFA",
  danger: "#EF4444",
  dangerSoft: "#FEF2F2",
};

type CalendarItemType = "event" | "trip";

function SafeClothImage({
  uri,
  style,
  iconSize = 24,
}: {
  uri?: string | null;
  style: any;
  iconSize?: number;
}) {
  if (!uri || typeof uri !== "string") {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <Ionicons name="image-outline" size={iconSize} color={palette.lightMuted} />
      </View>
    );
  }

  return <Image source={{ uri }} style={style} />;
}

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
    const currentDate = new Date(year, month, i);

    days.push({
      date: currentDate,
      dayNumber: i,
      isToday: currentDate.toDateString() === new Date().toDateString(),
    });
  }

  return days;
};

const TimePickerModal = ({
  visible,
  onClose,
  onSelect,
  currentTime = "",
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  currentTime?: string;
}) => {
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  useEffect(() => {
    if (currentTime) {
      const [time, period] = currentTime.split(" ");
      const [hour, minute] = time.split(":");

      setSelectedHour(hour || "12");
      setSelectedMinute(minute || "00");
      setSelectedPeriod(period || "AM");
    }
  }, [currentTime]);

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  const minutes = ["00", "15", "30", "45"];

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
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hora</Text>

              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.pickerItem,
                      selectedHour === hour && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedHour === hour && styles.pickerItemTextSelected,
                      ]}
                    >
                      {hour}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minuto</Text>

              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
              >
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.pickerItem,
                      selectedMinute === minute && styles.pickerItemSelected,
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMinute === minute && styles.pickerItemTextSelected,
                      ]}
                    >
                      {minute}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Periodo</Text>

              {["AM", "PM"].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonSelected,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextSelected,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerButtons}>
            <TouchableOpacity
              style={[styles.pickerButton, styles.pickerButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.pickerButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerButton, styles.pickerButtonConfirm]}
              onPress={handleConfirm}
            >
              <Text style={styles.pickerButtonTextConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DatePickerModal = ({
  visible,
  onClose,
  onSelect,
  currentDate = "",
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  currentDate?: string;
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (currentDate) {
      const parsedDate = new Date(currentDate);

      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        setCurrentMonth(parsedDate);
      }
    }
  }, [currentDate]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

  const getMonthDays = (date: Date) => {
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

  const days = getMonthDays(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleConfirm = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    onSelect(`${year}-${month}-${day}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>

          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color={palette.primary} />
            </TouchableOpacity>

            <Text style={styles.datePickerMonth}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>

            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color={palette.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRowMini}>
            {weekDays.map((day, index) => (
              <Text key={index} style={styles.weekDayTextMini}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGridMini}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.datePickerDay,
                  date && isSelectedDate(date) && styles.datePickerDaySelected,
                ]}
                onPress={() => date && setSelectedDate(date)}
                disabled={!date}
              >
                {date && (
                  <Text
                    style={[
                      styles.datePickerDayText,
                      isSelectedDate(date) && styles.datePickerDayTextSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.pickerButtons}>
            <TouchableOpacity
              style={[styles.pickerButton, styles.pickerButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.pickerButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickerButton, styles.pickerButtonConfirm]}
              onPress={handleConfirm}
            >
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

  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [trips, setTrips] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<CalendarItemType>("event");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [userOutfits, setUserOutfits] = useState<any[]>([]);
  const [userClothes, setUserClothes] = useState<Prenda[]>([]);
  const [loadingClothes, setLoadingClothes] = useState(false);

  const [selectedClothesEvent, setSelectedClothesEvent] = useState<string[]>([]);
  const [selectedClothesTrip, setSelectedClothesTrip] = useState<string[]>([]);

  const [showClothesPickerEvent, setShowClothesPickerEvent] = useState(false);
  const [showClothesPickerTrip, setShowClothesPickerTrip] = useState(false);
  const [showPackedListModal, setShowPackedListModal] = useState(false);
  const [selectedTripForList, setSelectedTripForList] =
    useState<CalendarEvent | null>(null);

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formOutfitId, setFormOutfitId] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const monthNames = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  useEffect(() => {
    setCalendarDays(getDaysInMonth(currentMonth));
  }, [currentMonth]);

  const loadEvents = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const data = await getUserEvents(String(user.id), month, year);
      const normalEvents = data.filter((e) => !(e as any).isTrip);

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
      const data = await getUserEvents(String(user.id));
      const tripsData = data.filter((e) => (e as any).isTrip);

      setTrips(tripsData);
    } catch (error) {
      console.error("Error cargando viajes:", error);
    }
  };

  const loadOutfits = async () => {
    if (!user?.id) return;

    try {
      const data = await getUserOutfits(String(user.id));
      setUserOutfits(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando outfits:", error);
    }
  };

  const loadUserClothes = async () => {
    if (!user?.id) {
      console.log("📅 Calendario: todavía no hay user.id");
      return [];
    }

    setLoadingClothes(true);

    try {
      const data = await getUserClothes(String(user.id));
      const clothes = Array.isArray(data) ? data : [];

      console.log(
        "📅 Prendas cargadas en calendario:",
        clothes.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          type: item.type,
          category: item.category,
        }))
      );

      setUserClothes(clothes);
      return clothes;
    } catch (error) {
      console.error("Error cargando prendas en calendario:", error);
      Alert.alert("Error", "No se pudieron cargar las prendas del armario.");
      setUserClothes([]);
      return [];
    } finally {
      setLoadingClothes(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadEvents();
      loadTrips();
      loadOutfits();
      loadUserClothes();
    }
  }, [user?.id, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadUserClothes();
      }
    }, [user?.id])
  );

  const openClothesPickerEvent = async () => {
    await loadUserClothes();
    setShowClothesPickerEvent(true);
  };

  const openClothesPickerTrip = async () => {
    await loadUserClothes();
    setShowClothesPickerTrip(true);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleAddEvent = () => {
    setModalType("event");
    setSelectedEvent(null);
    setSelectedDate(null);
    setFormTitle("");
    setFormDescription("");
    setFormStartTime("");
    setFormEndTime("");
    setFormOutfitId("");
    setSelectedClothesEvent([]);
    setModalVisible(true);
  };

  const handleAddTrip = () => {
    setModalType("trip");
    setSelectedEvent(null);
    setFormTitle("");
    setFormDescription("");
    setFormDestination("");
    setFormStartDate("");
    setFormEndDate("");
    setFormOutfitId("");
    setSelectedClothesTrip([]);
    setModalVisible(true);
  };

  const handleDayPress = (dayData: any) => {
    if (!dayData) return;

    setSelectedDay(dayData.dayNumber);

    const year = dayData.date.getFullYear();
    const month = String(dayData.date.getMonth() + 1).padStart(2, "0");
    const day = String(dayData.date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    setSelectedDate(dateStr);

    const dayEvent = events.find((e) => {
      if (!e.date) return false;

      const eventDate = new Date(e.date);

      return (
        eventDate.getDate() === dayData.dayNumber &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });

    if (dayEvent) {
      setSelectedEvent(dayEvent);
      setFormTitle(dayEvent.title);
      setFormDescription(dayEvent.description || "");
      setFormStartTime(dayEvent.startTime || "");
      setFormEndTime(dayEvent.endTime || "");
      setFormOutfitId(dayEvent.outfitId || "");
      setSelectedClothesEvent((dayEvent as any).selectedClothes || []);
      setModalType("event");
    } else {
      setSelectedEvent(null);
      setFormTitle("");
      setFormDescription("");
      setFormStartTime("");
      setFormEndTime("");
      setFormOutfitId("");
      setSelectedClothesEvent([]);
      setModalType("event");
    }

    setModalVisible(true);
  };

  const handleSaveEvent = async () => {
    if (!user?.id) return;

    if (modalType === "event") {
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
            outfitId: formOutfitId || undefined,
            selectedClothes: selectedClothesEvent,
          });

          Alert.alert("Éxito", "Evento actualizado");
        } else {
          await createEvent({
            userId: String(user.id),
            title: formTitle,
            description: formDescription || undefined,
            date: selectedDate,
            startTime: formStartTime || undefined,
            endTime: formEndTime || undefined,
            outfitId: formOutfitId || undefined,
            selectedClothes: selectedClothesEvent,
            isTrip: false,
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
      if (
        !formTitle.trim() ||
        !formDestination.trim() ||
        !formStartDate ||
        !formEndDate
      ) {
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
            selectedClothes: selectedClothesTrip,
            isTrip: true,
          });

          Alert.alert("Éxito", "Viaje actualizado");
        } else {
          await createEvent({
            userId: String(user.id),
            title: formTitle,
            description: formDescription || undefined,
            destination: formDestination,
            startDate: formStartDate,
            endDate: formEndDate,
            outfitId: formOutfitId || undefined,
            selectedClothes: selectedClothesTrip,
            isTrip: true,
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

    const deleteSelected = async () => {
      try {
        await deleteEvent(selectedEvent.id);
        Alert.alert("Éxito", "Elemento eliminado");
        setModalVisible(false);

        if (modalType === "event") loadEvents();
        else loadTrips();
      } catch (error) {
        console.error("Error eliminando:", error);
        Alert.alert("Error", "No se pudo eliminar");
      }
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm("¿Eliminar este elemento?");

      if (confirm) {
        await deleteSelected();
      }
    } else {
      Alert.alert("Eliminar", "¿Estás seguro?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: deleteSelected,
        },
      ]);
    }
  };

  const hasEventOnDay = (dayData: any) => {
    if (!dayData || events.length === 0) return false;

    return events.some((e) => {
      if (!e.date) return false;

      const eventDate = new Date(e.date);

      return (
        eventDate.getDate() === dayData.dayNumber &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const renderClothesPickerContent = (
    selectedClothes: string[],
    setSelectedClothes: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (loadingClothes) {
      return (
        <View style={styles.noClothesContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.noClothesText}>Cargando prendas...</Text>
        </View>
      );
    }

    if (userClothes.length === 0) {
      return (
        <View style={styles.noClothesContainer}>
          <Ionicons name="shirt-outline" size={48} color={palette.lightMuted} />
          <Text style={styles.noClothesText}>
            No se encontraron prendas. Ve a Armario y vuelve a intentar.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.clothesGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.clothesGridInner}>
          {userClothes.map((cloth) => {
            const clothId = String(cloth.id);
            const isSelected = selectedClothes.includes(clothId);

            return (
              <TouchableOpacity
                key={cloth.id}
                style={[styles.clothItem, isSelected && styles.clothItemSelected]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedClothes((prev) =>
                      prev.filter((id) => id !== clothId)
                    );
                  } else {
                    setSelectedClothes((prev) => [...prev, clothId]);
                  }
                }}
              >
                <SafeClothImage uri={cloth.imageUrl} style={styles.clothImage} />

                {isSelected && (
                  <View style={styles.clothCheckmark}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8", "#A78BFA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Calendario</Text>

          <Text style={styles.heroSubtitle}>
            Organiza eventos y viajes con el mismo estilo de Closi.
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.pageTitle}>Planificador</Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tabPressable}
              onPress={() => setActiveTab("calendar")}
            >
              {activeTab === "calendar" ? (
                <LinearGradient
                  colors={["#4A6FA5", "#8FB8A8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>Calendario</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>Calendario</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabPressable}
              onPress={() => setActiveTab("trips")}
            >
              {activeTab === "trips" ? (
                <LinearGradient
                  colors={["#4A6FA5", "#8FB8A8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>Mis Viajes</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>Mis Viajes</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {activeTab === "calendar" ? (
            <>
              <View style={styles.monthSelector}>
                <TouchableOpacity onPress={handlePrevMonth}>
                  <Ionicons name="chevron-back" size={22} color={palette.primary} />
                </TouchableOpacity>

                <Text style={styles.monthText}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>

                <TouchableOpacity onPress={handleNextMonth}>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={palette.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarCard}>
                <View style={styles.weekDaysRow}>
                  {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                    <Text key={index} style={styles.weekDayText}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={styles.calendarGrid}>
                  {calendarDays.map((dayData, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.calendarDay,
                        dayData?.isToday && styles.todayDay,
                        selectedDay === dayData?.dayNumber && styles.selectedDay,
                      ]}
                      onPress={() => handleDayPress(dayData)}
                      disabled={!dayData}
                    >
                      {dayData && (
                        <>
                          <Text
                            style={[
                              styles.calendarDayText,
                              dayData.isToday && styles.todayDayText,
                              selectedDay === dayData.dayNumber &&
                                styles.selectedDayText,
                            ]}
                          >
                            {dayData.dayNumber}
                          </Text>

                          {hasEventOnDay(dayData) && <View style={styles.eventDot} />}
                        </>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.eventsContainer}>
                <Text style={styles.sectionTitle}>Eventos</Text>

                {loading ? (
                  <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={palette.primary} />
                    <Text style={styles.emptyText}>Cargando eventos...</Text>
                  </View>
                ) : events.length > 0 ? (
                  events.map((event) => {
                    let dayNumber: number | null = null;
                    let monthName = "";

                    if (event.date) {
                      const dateVal = new Date(event.date);

                      if (!isNaN(dateVal.getTime())) {
                        dayNumber = dateVal.getDate();
                        monthName = monthNames[dateVal.getMonth()].toLowerCase();
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={event.id}
                        style={styles.eventCard}
                        onPress={() => {
                          setSelectedEvent(event);
                          setFormTitle(event.title);
                          setFormDescription(event.description || "");
                          setFormStartTime(event.startTime || "");
                          setFormEndTime(event.endTime || "");
                          setSelectedClothesEvent((event as any).selectedClothes || []);

                          if (event.date) {
                            const d = new Date(event.date);
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const day = String(d.getDate()).padStart(2, "0");

                            setSelectedDate(`${year}-${month}-${day}`);
                          }

                          setModalType("event");
                          setModalVisible(true);
                        }}
                      >
                        <View style={styles.eventTimeBadge}>
                          <Text style={styles.eventTimeText}>
                            {dayNumber ? `${dayNumber} ${monthName}` : "Sin fecha"}
                          </Text>
                        </View>

                        <View style={styles.eventContent}>
                          <Text style={styles.eventTitle}>{event.title}</Text>

                          {event.description ? (
                            <Text style={styles.eventDescription}>
                              {event.description}
                            </Text>
                          ) : null}

                          {(event as any).selectedClothes &&
                          (event as any).selectedClothes.length > 0 ? (
                            <View style={styles.selectedClothesPreview}>
                              {(event as any).selectedClothes
                                .slice(0, 4)
                                .map((clothId: string, idx: number) => {
                                  const cloth = userClothes.find(
                                    (c) => String(c.id) === String(clothId)
                                  );

                                  return cloth?.imageUrl ? (
                                    <SafeClothImage
                                      key={idx}
                                      uri={cloth.imageUrl}
                                      style={styles.clothPreviewImage}
                                      iconSize={18}
                                    />
                                  ) : null;
                                })}

                              {(event as any).selectedClothes.length > 4 && (
                                <View style={styles.moreClothesIndicator}>
                                  <Text style={styles.moreClothesText}>
                                    +{(event as any).selectedClothes.length - 4}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : null}
                        </View>

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={palette.lightMuted}
                        />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyStateCard}>
                    <Ionicons name="calendar-outline" size={42} color="#C7CDD6" />

                    <Text style={styles.emptyText}>No hay eventos</Text>

                    <TouchableOpacity
                      onPress={handleAddEvent}
                      style={styles.emptyButtonWrap}
                    >
                      <LinearGradient
                        colors={["#4A6FA5", "#8FB8A8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.emptyButton}
                      >
                        <Text style={styles.emptyButtonText}>Agregar Evento</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.tripsContainer}>
              {loading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color={palette.primary} />
                  <Text style={styles.emptyText}>Cargando viajes...</Text>
                </View>
              ) : trips.length === 0 ? (
                <View style={styles.emptyStateCardLarge}>
                  <Ionicons name="airplane-outline" size={48} color="#C7CDD6" />

                  <Text style={styles.emptyTextLarge}>
                    No tienes viajes planificados
                  </Text>

                  <TouchableOpacity
                    onPress={handleAddTrip}
                    style={styles.emptyButtonWrap}
                  >
                    <LinearGradient
                      colors={["#4A6FA5", "#8FB8A8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.emptyButton}
                    >
                      <Text style={styles.emptyButtonText}>Planificar Viaje</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                trips.map((trip) => (
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
                      setSelectedClothesTrip((trip as any).selectedClothes || []);
                      setModalType("trip");
                      setModalVisible(true);
                    }}
                  >
                    <View style={styles.tripHeader}>
                      <View style={styles.tripBadge}>
                        <Text style={styles.tripBadgeText}>
                          {(trip as any).startDate && (trip as any).endDate
                            ? `${(trip as any).startDate} - ${(trip as any).endDate}`
                            : "Próximamente"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.tripTitle}>{trip.title}</Text>

                    {(trip as any).destination ? (
                      <View style={styles.tripDetailItem}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={palette.secondary}
                        />

                        <Text style={styles.tripDetailText}>
                          {(trip as any).destination}
                        </Text>
                      </View>
                    ) : null}

                    {trip.description ? (
                      <Text style={styles.tripDescription}>{trip.description}</Text>
                    ) : null}

                    {(trip as any).selectedClothes &&
                    (trip as any).selectedClothes.length > 0 ? (
                      <TouchableOpacity
                        style={styles.packedItemsButton}
                        onPress={() => {
                          setSelectedTripForList(trip);
                          setShowPackedListModal(true);
                        }}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={16}
                          color={palette.secondary}
                        />

                        <Text style={styles.packedItemsButtonText}>
                          {(trip as any).selectedClothes.length} empacados
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fabWrapper}
        onPress={activeTab === "calendar" ? handleAddEvent : handleAddTrip}
      >
        <LinearGradient
          colors={["#4A6FA5", "#8FB8A8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fab}
        >
          <Ionicons
            name={activeTab === "calendar" ? "calendar-outline" : "airplane-outline"}
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.fabText}>
            {activeTab === "calendar" ? "Nuevo Evento" : "Nuevo Viaje"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedEvent
                  ? modalType === "event"
                    ? "Editar Evento"
                    : "Editar Viaje"
                  : modalType === "event"
                  ? "Nuevo Evento"
                  : "Nuevo Viaje"}
              </Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={palette.text} />
              </TouchableOpacity>
            </View>

            {modalType === "event" ? (
              <>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowEventDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={palette.primary} />

                  <Text style={styles.dateSelectorText}>
                    {selectedDate || "Seleccionar fecha"}
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.input}
                  placeholder="Título del evento"
                  placeholderTextColor="#A3A3A3"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción (opcional)"
                  placeholderTextColor="#A3A3A3"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={[styles.input, styles.timeInput]}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={formStartTime ? styles.timeText : styles.timePlaceholder}>
                      {formStartTime || "HH:MM"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.timeSeparator}>-</Text>

                  <TouchableOpacity
                    style={[styles.input, styles.timeInput]}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={formEndTime ? styles.timeText : styles.timePlaceholder}>
                      {formEndTime || "HH:MM"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.outfitSelector}>
                  <Text style={styles.label}>Selecciona prendas:</Text>

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={openClothesPickerEvent}
                    >
                      <Text style={styles.actionButtonText}>Seleccionar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary]}
                      onPress={() => {
                        Alert.alert("Sugerir", "Esta función estará disponible pronto");
                      }}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.actionButtonTextSecondary,
                        ]}
                      >
                        Sugerir
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedClothesEvent.length > 0 && (
                    <View style={styles.selectedClothesList}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedClothesEvent.map((clothId) => {
                          const cloth = userClothes.find(
                            (c) => String(c.id) === String(clothId)
                          );

                          return cloth?.imageUrl ? (
                            <SafeClothImage
                              key={clothId}
                              uri={cloth.imageUrl}
                              style={styles.selectedClothThumb}
                              iconSize={18}
                            />
                          ) : null;
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del viaje"
                  placeholderTextColor="#A3A3A3"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Destino"
                  placeholderTextColor="#A3A3A3"
                  value={formDestination}
                  onChangeText={setFormDestination}
                />

                <View style={styles.dateRangeRow}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={formStartDate ? styles.timeText : styles.timePlaceholder}>
                      {formStartDate || "Inicio"}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.dateSeparator}>a</Text>

                  <TouchableOpacity
                    style={[styles.input, styles.dateInput]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={formEndDate ? styles.timeText : styles.timePlaceholder}>
                      {formEndDate || "Fin"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del viaje (opcional)"
                  placeholderTextColor="#A3A3A3"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.outfitSelector}>
                  <Text style={styles.label}>Selecciona prendas a empacar:</Text>

                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={openClothesPickerTrip}
                    >
                      <Text style={styles.actionButtonText}>Hacer maleta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonSecondary]}
                      onPress={() => {
                        Alert.alert("Sugerir", "Esta función estará disponible pronto");
                      }}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.actionButtonTextSecondary,
                        ]}
                      >
                        Sugerir
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedClothesTrip.length > 0 && (
                    <View style={styles.selectedClothesList}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedClothesTrip.map((clothId) => {
                          const cloth = userClothes.find(
                            (c) => String(c.id) === String(clothId)
                          );

                          return cloth?.imageUrl ? (
                            <SafeClothImage
                              key={clothId}
                              uri={cloth.imageUrl}
                              style={styles.selectedClothThumb}
                              iconSize={18}
                            />
                          ) : null;
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
              {selectedEvent ? (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.saveWrap} onPress={handleSaveEvent}>
                <LinearGradient
                  colors={["#4A6FA5", "#8FB8A8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>
                    {selectedEvent ? "Actualizar" : "Guardar"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      <Modal
        visible={showClothesPickerEvent}
        animationType="fade"
        transparent
        onRequestClose={() => setShowClothesPickerEvent(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clothesPickerModal}>
            <View style={styles.clothesPickerHeader}>
              <Text style={styles.clothesPickerTitle}>Selecciona prendas</Text>

              <TouchableOpacity onPress={() => setShowClothesPickerEvent(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </TouchableOpacity>
            </View>

            {renderClothesPickerContent(selectedClothesEvent, setSelectedClothesEvent)}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowClothesPickerEvent(false)}
            >
              <LinearGradient
                colors={["#4A6FA5", "#8FB8A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneButtonGradient}
              >
                <Text style={styles.doneButtonText}>Hecho</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showClothesPickerTrip}
        animationType="fade"
        transparent
        onRequestClose={() => setShowClothesPickerTrip(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clothesPickerModal}>
            <View style={styles.clothesPickerHeader}>
              <Text style={styles.clothesPickerTitle}>
                Selecciona prendas a empacar
              </Text>

              <TouchableOpacity onPress={() => setShowClothesPickerTrip(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </TouchableOpacity>
            </View>

            {renderClothesPickerContent(selectedClothesTrip, setSelectedClothesTrip)}

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowClothesPickerTrip(false)}
            >
              <LinearGradient
                colors={["#4A6FA5", "#8FB8A8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneButtonGradient}
              >
                <Text style={styles.doneButtonText}>Hecho</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPackedListModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPackedListModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.packedListModal}>
            <View style={styles.packedListHeader}>
              <Text style={styles.packedListTitle}>Lista para viaje</Text>

              <TouchableOpacity onPress={() => setShowPackedListModal(false)}>
                <Ionicons name="close" size={24} color={palette.text} />
              </TouchableOpacity>
            </View>

            {selectedTripForList && (
              <Text style={styles.packedListTripTitle}>
                {selectedTripForList.title}
              </Text>
            )}

            <ScrollView style={styles.packedListContent} showsVerticalScrollIndicator={false}>
              {selectedTripForList && (selectedTripForList as any).selectedClothes ? (
                ((selectedTripForList as any).selectedClothes as string[]).map(
                  (clothId) => {
                    const cloth = userClothes.find(
                      (c) => String(c.id) === String(clothId)
                    );

                    return cloth ? (
                      <View key={clothId} style={styles.packedListItem}>
                        <SafeClothImage
                          uri={cloth.imageUrl}
                          style={styles.packedListImage}
                          iconSize={22}
                        />

                        <View style={styles.packedListItemInfo}>
                          <Text style={styles.packedListItemText}>
                            {cloth.category || cloth.type || "Prenda"}
                          </Text>

                          {cloth.color && (
                            <Text style={styles.packedListItemDetail}>
                              {cloth.color}
                            </Text>
                          )}
                        </View>
                      </View>
                    ) : null;
                  }
                )
              ) : (
                <Text style={styles.noPackedItemsText}>No hay prendas empacadas</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  hero: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 310,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 18,
  },
  tabContainer: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 6,
    marginBottom: 18,
    flexDirection: "row",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  tabPressable: {
    flex: 1,
  },
  tabActive: {
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabInactive: {
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  tabTextInactive: {
    color: palette.lightMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  monthSelector: {
    backgroundColor: palette.card,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2430",
    letterSpacing: 1,
  },
  calendarCard: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 18,
    marginBottom: 22,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: palette.lightMuted,
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderRadius: 999,
  },
  calendarDayText: {
    fontSize: 16,
    color: palette.text,
  },
  todayDay: {
    backgroundColor: "#F3F4F6",
  },
  todayDayText: {
    fontWeight: "700",
    color: palette.primary,
  },
  selectedDay: {
    backgroundColor: palette.primary,
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  eventDot: {
    position: "absolute",
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.primary,
  },
  eventsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 14,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  eventTimeBadge: {
    backgroundColor: "rgba(74,111,165,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  eventTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.primary,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: palette.muted,
    lineHeight: 20,
  },
  selectedClothesPreview: {
    flexDirection: "row",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
  },
  emptyStateCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
  },
  emptyStateCardLarge: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyText: {
    marginTop: 12,
    color: palette.lightMuted,
    fontSize: 15,
    textAlign: "center",
  },
  emptyTextLarge: {
    marginTop: 12,
    marginBottom: 18,
    color: palette.lightMuted,
    fontSize: 16,
    textAlign: "center",
  },
  emptyButtonWrap: {
    minWidth: 180,
    marginTop: 16,
  },
  emptyButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  tripsContainer: {
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#1F2A44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tripHeader: {
    marginBottom: 12,
  },
  tripBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: "rgba(143,184,168,0.14)",
  },
  tripBadgeText: {
    color: palette.secondary,
    fontSize: 11,
    fontWeight: "700",
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 8,
  },
  tripDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tripDetailText: {
    fontSize: 14,
    color: palette.muted,
    marginLeft: 6,
  },
  tripDescription: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 6,
    lineHeight: 20,
  },
  packedItemsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  packedItemsButtonText: {
    color: palette.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  fabWrapper: {
    position: "absolute",
    right: 24,
    bottom: 24,
  },
  fab: {
    minWidth: 170,
    height: 60,
    borderRadius: 999,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A6FA5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  fabText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    width: "100%",
    backgroundColor: palette.card,
    borderRadius: 30,
    padding: 22,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.text,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D9D6CF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  dateSelectorText: {
    fontSize: 16,
    color: palette.text,
    marginLeft: 12,
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D9D6CF",
    borderRadius: 22,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    color: palette.text,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
    justifyContent: "center",
  },
  timeText: {
    fontSize: 15,
    color: palette.text,
  },
  timePlaceholder: {
    fontSize: 15,
    color: "#A3A3A3",
  },
  timeSeparator: {
    marginHorizontal: 12,
    fontSize: 18,
    color: "#C4C0B8",
  },
  dateRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dateInput: {
    flex: 1,
    marginBottom: 0,
    justifyContent: "center",
  },
  dateSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: "#C4C0B8",
  },
  outfitSelector: {
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    color: palette.text,
    marginBottom: 12,
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  deleteButton: {
    borderWidth: 1.5,
    borderColor: palette.danger,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: palette.dangerSoft,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: palette.danger,
    fontWeight: "700",
  },
  saveWrap: {
    minWidth: 150,
  },
  saveButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  pickerModal: {
    width: "85%",
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 20,
    maxHeight: "75%",
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.text,
    marginBottom: 10,
  },
  pickerScroll: {
    maxHeight: 150,
    width: "100%",
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  pickerItemSelected: {
    backgroundColor: palette.primary,
  },
  pickerItemText: {
    fontSize: 16,
    color: palette.text,
  },
  pickerItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  periodButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    marginVertical: 4,
    width: "85%",
    alignItems: "center",
  },
  periodButtonSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  periodButtonText: {
    fontSize: 15,
    color: palette.text,
  },
  periodButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  pickerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 18,
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 18,
    minWidth: 120,
    alignItems: "center",
  },
  pickerButtonCancel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: palette.border,
  },
  pickerButtonConfirm: {
    backgroundColor: palette.primary,
  },
  pickerButtonTextCancel: {
    color: palette.text,
    fontWeight: "700",
  },
  pickerButtonTextConfirm: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  datePickerMonth: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  weekDaysRowMini: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayTextMini: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: palette.lightMuted,
    fontWeight: "600",
  },
  daysGridMini: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  datePickerDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },
  datePickerDaySelected: {
    backgroundColor: palette.primary,
  },
  datePickerDayText: {
    fontSize: 14,
    color: palette.text,
  },
  datePickerDayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: palette.primary,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: palette.primary,
  },
  selectedClothesList: {
    marginTop: 8,
  },
  selectedClothThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 8,
  },
  clothPreviewImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 4,
  },
  moreClothesIndicator: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: palette.lightMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  moreClothesText: {
    fontSize: 10,
    fontWeight: "600",
    color: palette.text,
  },
  clothesPickerModal: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 20,
  },
  clothesPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  clothesPickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.text,
  },
  noClothesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noClothesText: {
    marginTop: 12,
    color: palette.lightMuted,
    fontSize: 14,
    textAlign: "center",
  },
  clothesGrid: {
    maxHeight: 400,
  },
  clothesGridInner: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  clothItem: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  clothItemSelected: {
    borderColor: palette.primary,
  },
  clothImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "#EEF3F7",
    alignItems: "center",
    justifyContent: "center",
  },
  clothCheckmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  doneButton: {
    marginTop: 16,
  },
  doneButtonGradient: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  packedListModal: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 20,
  },
  packedListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  packedListTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.text,
  },
  packedListTripTitle: {
    fontSize: 14,
    color: palette.muted,
    marginBottom: 16,
  },
  packedListContent: {
    maxHeight: 300,
  },
  packedListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  packedListImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  packedListItemInfo: {
    flex: 1,
  },
  packedListItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.text,
  },
  packedListItemDetail: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 2,
  },
  noPackedItemsText: {
    textAlign: "center",
    color: palette.lightMuted,
    fontSize: 14,
    marginTop: 20,
  },
});