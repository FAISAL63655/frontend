// ScheduleService.js - خدمة للتعامل مع الجداول الدراسية

import supabase from './supabaseClient';

/**
 * خدمة الجداول الدراسية
 */
class ScheduleService {
  /**
   * الحصول على جميع الجداول الدراسية
   * @returns {Promise} وعد بقائمة الجداول الدراسية
   */
  static async getSchedules() {
    try {
      console.log('Fetching all schedules');

      // Obtener todos los horarios
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .order('day_of_week')
        .order('period');

      if (scheduleError) {
        console.error('Error fetching schedules:', scheduleError);
        throw scheduleError;
      }

      console.log('Raw schedule data:', scheduleData);

      // Si no hay horarios, devolvemos un array vacío
      if (!scheduleData || scheduleData.length === 0) {
        return [];
      }

      // Obtener todos los IDs de clases, secciones y materias
      const classIds = [...new Set(scheduleData.map(schedule => schedule.class_id))];
      const sectionIds = [...new Set(scheduleData.map(schedule => schedule.section_id))];
      const subjectIds = [...new Set(scheduleData
        .filter(schedule => schedule.subject_id)
        .map(schedule => schedule.subject_id))];

      // Obtener datos de clases
      let classesMap = {};
      if (classIds.length > 0) {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds);

        if (classesError) {
          console.error('Error fetching classes data:', classesError);
        } else if (classesData) {
          classesMap = classesData.reduce((map, cls) => {
            map[cls.id] = cls.name;
            return map;
          }, {});
        }
      }

      // Obtener datos de secciones
      let sectionsMap = {};
      if (sectionIds.length > 0) {
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, name')
          .in('id', sectionIds);

        if (sectionsError) {
          console.error('Error fetching sections data:', sectionsError);
        } else if (sectionsData) {
          sectionsMap = sectionsData.reduce((map, section) => {
            map[section.id] = section.name;
            return map;
          }, {});
        }
      }

      // Obtener datos de materias
      let subjectsMap = {};
      if (subjectIds.length > 0) {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        if (subjectsError) {
          console.error('Error fetching subjects data:', subjectsError);
        } else if (subjectsData) {
          subjectsMap = subjectsData.reduce((map, subject) => {
            map[subject.id] = subject.name;
            return map;
          }, {});
        }
      }

      // Transformar los datos para la interfaz
      const result = scheduleData.map(schedule => ({
        id: schedule.id,
        day_of_week: schedule.day_of_week,
        period: schedule.period,
        class_id: schedule.class_id,
        section_id: schedule.section_id,
        subject_id: schedule.subject_id,
        class_name: classesMap[schedule.class_id] || '',
        section_name: sectionsMap[schedule.section_id] || '',
        subject_name: schedule.subject_id ? subjectsMap[schedule.subject_id] || '' : '',
        subject_info: schedule.subject_info,
        // Para compatibilidad con la interfaz
        day: schedule.day_of_week,
        class: classesMap[schedule.class_id] || '',
        section: sectionsMap[schedule.section_id] || '',
        subject: schedule.subject_id ? subjectsMap[schedule.subject_id] || '' : ''
      }));

      console.log('Processed schedule data:', result);
      return result;
    } catch (error) {
      console.error('Error in getSchedules:', error);
      throw error;
    }
  }

  /**
   * الحصول على الجداول الدراسية حسب الصف والقسم
   * @param {number} classId معرف الصف
   * @param {number} sectionId معرف القسم
   * @returns {Promise} وعد بقائمة الجداول الدراسية
   */
  static async getSchedulesByClassAndSection(classId, sectionId) {
    try {
      console.log(`Fetching schedules for class ${classId} and section ${sectionId}`);

      // Primero, obtenemos los horarios
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .order('day_of_week')
        .order('period');

      if (scheduleError) {
        console.error(`Error fetching schedules for class ${classId} and section ${sectionId}:`, scheduleError);
        throw scheduleError;
      }

      console.log('Raw schedule data:', scheduleData);

      // Si no hay horarios, devolvemos un array vacío
      if (!scheduleData || scheduleData.length === 0) {
        return [];
      }

      // Obtenemos los datos de las clases
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error(`Error fetching class data for id ${classId}:`, classError);
      }

      // Obtenemos los datos de las secciones
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('id, name')
        .eq('id', sectionId)
        .single();

      if (sectionError) {
        console.error(`Error fetching section data for id ${sectionId}:`, sectionError);
      }

      // Obtenemos los IDs de las materias para hacer una sola consulta
      const subjectIds = scheduleData
        .filter(schedule => schedule.subject_id)
        .map(schedule => schedule.subject_id);

      let subjectsMap = {};

      if (subjectIds.length > 0) {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        if (subjectsError) {
          console.error('Error fetching subjects data:', subjectsError);
        } else if (subjectsData) {
          // Creamos un mapa de ID de materia a nombre de materia
          subjectsMap = subjectsData.reduce((map, subject) => {
            map[subject.id] = subject.name;
            return map;
          }, {});
        }
      }

      // Transformamos los datos para la interfaz
      const result = scheduleData.map(schedule => ({
        id: schedule.id,
        day_of_week: schedule.day_of_week,
        period: schedule.period,
        class_id: schedule.class_id,
        section_id: schedule.section_id,
        subject_id: schedule.subject_id,
        class_name: classData ? classData.name : '',
        section_name: sectionData ? sectionData.name : '',
        subject_name: schedule.subject_id ? subjectsMap[schedule.subject_id] || '' : '',
        subject_info: schedule.subject_info,
        // Para compatibilidad con la interfaz
        day: schedule.day_of_week,
        class: classData ? classData.name : '',
        section: sectionData ? sectionData.name : '',
        subject: schedule.subject_id ? subjectsMap[schedule.subject_id] || '' : ''
      }));

      console.log('Processed schedule data:', result);
      return result;
    } catch (error) {
      console.error(`Error in getSchedulesByClassAndSection(${classId}, ${sectionId}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على الجداول الدراسية لليوم الحالي
   * @returns {Promise} وعد بقائمة الجداول الدراسية
   */
  static async getTodaySchedules() {
    try {
      // Obtener el número del día de la semana (0 = domingo, 1 = lunes, etc.)
      const today = new Date().getDay();
      const dayOfWeek = today;

      console.log(`Fetching schedules for today (day ${dayOfWeek})`);

      // Obtener los horarios para hoy
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .order('period');

      if (scheduleError) {
        console.error(`Error fetching schedules for today (day ${dayOfWeek}):`, scheduleError);
        throw scheduleError;
      }

      console.log('Raw today schedule data:', scheduleData);

      // Si no hay horarios, devolvemos un array vacío
      if (!scheduleData || scheduleData.length === 0) {
        return [];
      }

      // Obtener todos los IDs de clases, secciones y materias
      const classIds = [...new Set(scheduleData.map(schedule => schedule.class_id))];
      const sectionIds = [...new Set(scheduleData.map(schedule => schedule.section_id))];
      const subjectIds = [...new Set(scheduleData
        .filter(schedule => schedule.subject_id)
        .map(schedule => schedule.subject_id))];

      // Obtener datos de clases
      let classesMap = {};
      if (classIds.length > 0) {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds);

        if (classesError) {
          console.error('Error fetching classes data:', classesError);
        } else if (classesData) {
          classesMap = classesData.reduce((map, cls) => {
            map[cls.id] = cls.name;
            return map;
          }, {});
        }
      }

      // Obtener datos de secciones
      let sectionsMap = {};
      if (sectionIds.length > 0) {
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, name')
          .in('id', sectionIds);

        if (sectionsError) {
          console.error('Error fetching sections data:', sectionsError);
        } else if (sectionsData) {
          sectionsMap = sectionsData.reduce((map, section) => {
            map[section.id] = section.name;
            return map;
          }, {});
        }
      }

      // Obtener datos de materias
      let subjectsMap = {};
      if (subjectIds.length > 0) {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', subjectIds);

        if (subjectsError) {
          console.error('Error fetching subjects data:', subjectsError);
        } else if (subjectsData) {
          subjectsMap = subjectsData.reduce((map, subject) => {
            map[subject.id] = subject.name;
            return map;
          }, {});
        }
      }

      // Transformar los datos para la interfaz
      const result = scheduleData.map(schedule => ({
        id: schedule.id,
        day_of_week: schedule.day_of_week,
        period: schedule.period,
        class_id: schedule.class_id,
        section_id: schedule.section_id,
        subject_id: schedule.subject_id,
        class_name: classesMap[schedule.class_id] || '',
        section_name: sectionsMap[schedule.section_id] || '',
        subject_name: schedule.subject_id ? subjectsMap[schedule.subject_id] || '' : '',
        subject_info: schedule.subject_info,
        // Añadir información de tiempo
        time: ScheduleService.getPeriodTime(schedule.period),
        // Para compatibilidad con la interfaz
        day: schedule.day_of_week,
        class: classesMap[schedule.class_id] || '',
        section: sectionsMap[schedule.section_id] || '',
        subject: schedule.subject_id ? subjectsMap[schedule.subject_id] || '' : ''
      }));

      console.log('Processed today schedule data:', result);
      return result;
    } catch (error) {
      console.error('Error in getTodaySchedules:', error);
      throw error;
    }
  }

  /**
   * الحصول على جدول دراسي بواسطة المعرف
   * @param {number} id معرف الجدول الدراسي
   * @returns {Promise} وعد بالجدول الدراسي
   */
  static async getScheduleById(id) {
    try {
      console.log(`Fetching schedule with id ${id}`);

      // Validar el ID
      if (!id) {
        throw new Error('Schedule ID is required');
      }

      const scheduleId = Number(id);

      // Obtener el horario
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) {
        console.error(`Error fetching schedule with id ${scheduleId}:`, scheduleError);
        throw scheduleError;
      }

      console.log('Raw schedule data:', scheduleData);

      if (!scheduleData) {
        throw new Error(`Schedule with id ${scheduleId} not found`);
      }

      // Obtener datos de la clase
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', scheduleData.class_id)
        .single();

      if (classError) {
        console.error(`Error fetching class data for id ${scheduleData.class_id}:`, classError);
      }

      // Obtener datos de la sección
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('name')
        .eq('id', scheduleData.section_id)
        .single();

      if (sectionError) {
        console.error(`Error fetching section data for id ${scheduleData.section_id}:`, sectionError);
      }

      // Obtener datos de la materia si existe
      let subjectName = null;
      if (scheduleData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', scheduleData.subject_id)
          .single();

        if (subjectError) {
          console.error(`Error fetching subject data for id ${scheduleData.subject_id}:`, subjectError);
        } else if (subjectData) {
          subjectName = subjectData.name;
        }
      }

      // Preparar la respuesta
      const result = {
        id: scheduleData.id,
        day_of_week: scheduleData.day_of_week,
        period: scheduleData.period,
        class_id: scheduleData.class_id,
        section_id: scheduleData.section_id,
        subject_id: scheduleData.subject_id,
        class_name: classData ? classData.name : '',
        section_name: sectionData ? sectionData.name : '',
        subject_name: subjectName,
        subject_info: scheduleData.subject_info,
        // Para compatibilidad con la interfaz
        day: scheduleData.day_of_week,
        class: classData ? classData.name : '',
        section: sectionData ? sectionData.name : '',
        subject: subjectName
      };

      console.log('Processed schedule data:', result);
      return result;
    } catch (error) {
      console.error(`Error in getScheduleById(${id}):`, error);
      throw error;
    }
  }

  /**
   * إنشاء جدول دراسي جديد
   * @param {Object} scheduleData بيانات الجدول الدراسي
   * @returns {Promise} وعد بالجدول الدراسي المنشأ
   */
  static async createSchedule(scheduleData) {
    try {
      console.log('Creating schedule with data:', scheduleData);

      // Validar los datos
      if (scheduleData.day_of_week === undefined || scheduleData.period === undefined ||
          scheduleData.class_id === undefined || scheduleData.section_id === undefined) {
        throw new Error('Missing required schedule data');
      }

      // Convertir a números si es necesario
      const dayOfWeek = Number(scheduleData.day_of_week);
      const period = Number(scheduleData.period);
      const classId = Number(scheduleData.class_id);
      const sectionId = Number(scheduleData.section_id);
      const subjectId = scheduleData.subject_id ? Number(scheduleData.subject_id) : null;

      // Verificar si ya existe un horario para este día, período, clase y sección
      const { data: existingSchedule, error: checkError } = await supabase
        .from('schedules')
        .select('id')
        .eq('day_of_week', dayOfWeek)
        .eq('period', period)
        .eq('class_id', classId)
        .eq('section_id', sectionId);

      if (checkError) {
        console.error('Error checking for schedule conflicts:', checkError);
        throw checkError;
      }

      if (existingSchedule && existingSchedule.length > 0) {
        console.warn('Schedule conflict found:', existingSchedule);
        throw new Error('يوجد جدول دراسي آخر في نفس اليوم والفترة للصف والقسم المحددين');
      }

      // Crear el horario
      const scheduleToInsert = {
        day_of_week: dayOfWeek,
        period: period,
        class_id: classId,
        section_id: sectionId,
        subject_id: subjectId,
        subject_info: scheduleData.subject_info || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting schedule:', scheduleToInsert);

      const { data, error } = await supabase
        .from('schedules')
        .insert([scheduleToInsert])
        .select();

      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned after creating schedule');
      }

      console.log('Schedule created successfully:', data[0]);

      // Obtener datos relacionados para la respuesta
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error('Error fetching class data:', classError);
      }

      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('name')
        .eq('id', sectionId)
        .single();

      if (sectionError) {
        console.error('Error fetching section data:', sectionError);
      }

      let subjectName = null;
      if (subjectId) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', subjectId)
          .single();

        if (subjectError) {
          console.error('Error fetching subject data:', subjectError);
        } else if (subjectData) {
          subjectName = subjectData.name;
        }
      }

      // Preparar la respuesta
      const result = {
        id: data[0].id,
        day_of_week: data[0].day_of_week,
        period: data[0].period,
        class_id: data[0].class_id,
        section_id: data[0].section_id,
        subject_id: data[0].subject_id,
        class_name: classData ? classData.name : '',
        section_name: sectionData ? sectionData.name : '',
        subject_name: subjectName,
        subject_info: data[0].subject_info,
        // Para compatibilidad con la interfaz
        day: data[0].day_of_week,
        class: classData ? classData.name : '',
        section: sectionData ? sectionData.name : '',
        subject: subjectName
      };

      console.log('Returning formatted schedule:', result);
      return result;
    } catch (error) {
      console.error('Error in createSchedule:', error);
      throw error;
    }
  }

  /**
   * تحديث جدول دراسي
   * @param {number} id معرف الجدول الدراسي
   * @param {Object} scheduleData بيانات الجدول الدراسي
   * @returns {Promise} وعد بالجدول الدراسي المحدث
   */
  static async updateSchedule(id, scheduleData) {
    try {
      console.log(`Updating schedule with id ${id}:`, scheduleData);

      // Validar los datos
      if (!id) {
        throw new Error('Schedule ID is required');
      }

      if (scheduleData.day_of_week === undefined || scheduleData.period === undefined ||
          scheduleData.class_id === undefined || scheduleData.section_id === undefined) {
        throw new Error('Missing required schedule data');
      }

      // Convertir a números si es necesario
      const scheduleId = Number(id);
      const dayOfWeek = Number(scheduleData.day_of_week);
      const period = Number(scheduleData.period);
      const classId = Number(scheduleData.class_id);
      const sectionId = Number(scheduleData.section_id);
      const subjectId = scheduleData.subject_id ? Number(scheduleData.subject_id) : null;

      // Verificar si ya existe un horario para este día, período, clase y sección (excepto el actual)
      const { data: existingSchedule, error: checkError } = await supabase
        .from('schedules')
        .select('id')
        .eq('day_of_week', dayOfWeek)
        .eq('period', period)
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .neq('id', scheduleId);

      if (checkError) {
        console.error('Error checking for schedule conflicts:', checkError);
        throw checkError;
      }

      if (existingSchedule && existingSchedule.length > 0) {
        console.warn('Schedule conflict found:', existingSchedule);
        throw new Error('يوجد جدول دراسي آخر في نفس اليوم والفترة للصف والقسم المحددين');
      }

      // Actualizar el horario
      const scheduleToUpdate = {
        day_of_week: dayOfWeek,
        period: period,
        class_id: classId,
        section_id: sectionId,
        subject_id: subjectId,
        subject_info: scheduleData.subject_info || null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating schedule with data:', scheduleToUpdate);

      const { data, error } = await supabase
        .from('schedules')
        .update(scheduleToUpdate)
        .eq('id', scheduleId)
        .select();

      if (error) {
        console.error(`Error updating schedule with id ${scheduleId}:`, error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(`No data returned after updating schedule ${scheduleId}`);
      }

      console.log('Schedule updated successfully:', data[0]);

      // Obtener datos relacionados para la respuesta
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', classId)
        .single();

      if (classError) {
        console.error('Error fetching class data:', classError);
      }

      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('name')
        .eq('id', sectionId)
        .single();

      if (sectionError) {
        console.error('Error fetching section data:', sectionError);
      }

      let subjectName = null;
      if (subjectId) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', subjectId)
          .single();

        if (subjectError) {
          console.error('Error fetching subject data:', subjectError);
        } else if (subjectData) {
          subjectName = subjectData.name;
        }
      }

      // Preparar la respuesta
      const result = {
        id: data[0].id,
        day_of_week: data[0].day_of_week,
        period: data[0].period,
        class_id: data[0].class_id,
        section_id: data[0].section_id,
        subject_id: data[0].subject_id,
        class_name: classData ? classData.name : '',
        section_name: sectionData ? sectionData.name : '',
        subject_name: subjectName,
        subject_info: data[0].subject_info,
        // Para compatibilidad con la interfaz
        day: data[0].day_of_week,
        class: classData ? classData.name : '',
        section: sectionData ? sectionData.name : '',
        subject: subjectName
      };

      console.log('Returning formatted updated schedule:', result);
      return result;
    } catch (error) {
      console.error(`Error in updateSchedule(${id}):`, error);
      throw error;
    }
  }

  /**
   * حذف جدول دراسي
   * @param {number} id معرف الجدول الدراسي
   * @returns {Promise} وعد بنتيجة العملية
   */
  static async deleteSchedule(id) {
    try {
      console.log(`Deleting schedule with id ${id}`);

      // Validar el ID
      if (!id) {
        throw new Error('Schedule ID is required');
      }

      const scheduleId = Number(id);

      // Verificar si el horario existe
      const { data: existingSchedule, error: checkError } = await supabase
        .from('schedules')
        .select('id')
        .eq('id', scheduleId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 es el código para 'no se encontró ningún registro'
        console.error(`Error checking if schedule ${scheduleId} exists:`, checkError);
        throw checkError;
      }

      if (!existingSchedule) {
        console.warn(`Schedule with id ${scheduleId} not found`);
        return true; // Si no existe, consideramos que ya está eliminado
      }

      // Eliminar el horario
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) {
        console.error(`Error deleting schedule with id ${scheduleId}:`, error);
        throw error;
      }

      console.log(`Schedule with id ${scheduleId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error in deleteSchedule(${id}):`, error);
      throw error;
    }
  }

  /**
   * الحصول على وقت الفترة (حصة دراسية)
   * @param {number} period رقم الفترة
   * @returns {string} وقت الفترة
   */
  static getPeriodTime(period) {
    // يمكن تعديل هذه الأوقات حسب الحاجة
    const periodTimes = {
      1: '08:00 - 08:45',
      2: '08:50 - 09:35',
      3: '09:40 - 10:25',
      4: '10:30 - 11:15',
      5: '11:20 - 12:05',
      6: '12:10 - 12:55',
      7: '13:00 - 13:45'
    };

    return periodTimes[period] || '';
  }
}

export default ScheduleService;
