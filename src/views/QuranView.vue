<template>
  <div>
    <h1 class="text-h4 mb-4">القرآن الكريم</h1>

    <v-card class="mb-4">
      <v-card-title>
        <v-icon start icon="mdi-book-open-variant"></v-icon>
        القرآن الكريم
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedSurah"
              :items="surahs"
              item-title="name"
              item-value="number"
              label="السورة"
              variant="outlined"
              density="compact"
              @update:model-value="loadSurah"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="reciter"
              :items="reciters"
              item-title="name"
              item-value="id"
              label="القارئ"
              variant="outlined"
              density="compact"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn-group>
              <v-btn prepend-icon="mdi-play" color="primary" @click="playAudio">
                استماع
              </v-btn>
              <v-btn prepend-icon="mdi-pause" @click="pauseAudio">
                إيقاف
              </v-btn>
              <v-btn prepend-icon="mdi-stop" @click="stopAudio">
                إنهاء
              </v-btn>
            </v-btn-group>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>
        <v-icon start icon="mdi-book-open-page-variant"></v-icon>
        القرآن الكريم من موقع مقرئ
      </v-card-title>
      <v-card-text>
        <div class="iframe-container">
          <iframe
            src="https://ar.muqri.com/"
            width="100%"
            height="600"
            frameborder="0"
            allowfullscreen
            title="موقع مقرئ للقرآن الكريم"
            loading="lazy"
            class="quran-iframe"
          ></iframe>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-card-title>
        <v-icon start icon="mdi-information"></v-icon>
        ملاحظة
      </v-card-title>
      <v-card-text>
        <p>تم دمج موقع مقرئ (ar.muqri.com) للقرآن الكريم في هذه الصفحة.</p>
        <p>يمكنك استخدام جميع ميزات الموقع مباشرة من خلال هذه النافذة.</p>
        <p>للمزيد من الخيارات، يمكنك زيارة <a href="https://ar.muqri.com/" target="_blank" rel="noopener noreferrer">موقع مقرئ</a> مباشرة.</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Data
const selectedSurah = ref(1)
const reciter = ref('mishari')
const loading = ref(false)
const surahContent = ref([])

// Surahs list
const surahs = ref([
  { number: 1, name: 'الفاتحة', ayahs: 7 },
  { number: 2, name: 'البقرة', ayahs: 286 },
  { number: 3, name: 'آل عمران', ayahs: 200 },
  { number: 4, name: 'النساء', ayahs: 176 },
  { number: 5, name: 'المائدة', ayahs: 120 },
  { number: 6, name: 'الأنعام', ayahs: 165 },
  { number: 7, name: 'الأعراف', ayahs: 206 },
  { number: 8, name: 'الأنفال', ayahs: 75 },
  { number: 9, name: 'التوبة', ayahs: 129 },
  { number: 10, name: 'يونس', ayahs: 109 }
  // In a real app, this would include all 114 surahs
])

// Reciters list
const reciters = ref([
  { id: 'mishari', name: 'مشاري راشد العفاسي' },
  { id: 'sudais', name: 'عبد الرحمن السديس' },
  { id: 'shuraim', name: 'سعود الشريم' }
])

// Get selected surah details
const selectedSurahDetails = ref({
  name: 'الفاتحة',
  ayahs: 7
})

// Load surah content
const loadSurah = async () => {
  loading.value = true

  try {
    // In a real app, this would fetch from an API
    // const response = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.value}`)
    // const data = await response.json()
    // surahContent.value = data.data.ayahs

    // For demo, we'll use dummy data
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

    // Update selected surah details
    const surah = surahs.value.find(s => s.number === selectedSurah.value)
    if (surah) {
      selectedSurahDetails.value = surah
    }

    // Generate dummy ayahs
    surahContent.value = Array.from({ length: selectedSurahDetails.value.ayahs }, (_, i) => ({
      number: i + 1,
      numberInSurah: i + 1,
      text: `نص الآية ${i + 1} من سورة ${selectedSurahDetails.value.name}`
    }))

    // Special case for Al-Fatiha
    if (selectedSurah.value === 1) {
      surahContent.value = [
        { number: 1, numberInSurah: 1, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
        { number: 2, numberInSurah: 2, text: 'الرَّحْمَنِ الرَّحِيمِ' },
        { number: 3, numberInSurah: 3, text: 'مَالِكِ يَوْمِ الدِّينِ' },
        { number: 4, numberInSurah: 4, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
        { number: 5, numberInSurah: 5, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
        { number: 6, numberInSurah: 6, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' },
        { number: 7, numberInSurah: 7, text: 'آمين' }
      ]
    }
  } catch (error) {
    console.error('Error loading surah:', error)
  } finally {
    loading.value = false
  }
}

// Audio controls
const playAudio = () => {
  alert(`تشغيل سورة ${selectedSurahDetails.value.name} بصوت ${reciters.value.find(r => r.id === reciter.value).name}`)
}

const pauseAudio = () => {
  alert('تم إيقاف التلاوة مؤقتًا')
}

const stopAudio = () => {
  alert('تم إيقاف التلاوة')
}

// Load initial surah on component mount
onMounted(() => {
  loadSurah()
})
</script>

<style scoped>
.quran-text {
  direction: rtl;
  font-family: 'Traditional Arabic', 'Scheherazade', serif;
  line-height: 2;
  padding: 20px;
}

.bismillah {
  font-size: 24px;
  margin-bottom: 20px;
}

.surah-content {
  text-align: justify;
}

.ayah {
  margin-bottom: 10px;
  font-size: 20px;
}

.ayah-number {
  font-size: 16px;
  color: #1976D2;
  margin-right: 5px;
}

.iframe-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 4px;
}

.quran-iframe {
  border: none;
  width: 100%;
  height: 600px;
}
</style>
