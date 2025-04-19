<template>
  <v-dialog
    :model-value="show"
    @update:model-value="$emit('update:show', $event)"
    max-width="600"
    transition="dialog-bottom-transition"
    :overlay-opacity="0.8"
    :retain-focus="false"
  >
    <v-card class="encouragement-card">
      <v-card-title class="text-center pa-5">
        <v-icon size="x-large" color="success" class="mb-3 animate-bounce">
          mdi-check-circle
        </v-icon>
        <div class="text-h4 success--text font-weight-bold animate-fade-in">
          تم تسجيل الواجب!
        </div>
      </v-card-title>

      <v-card-text class="text-center pa-5">
        <v-avatar size="150" class="mb-5 elevation-5 animate-scale-in">
          <v-img
            :src="studentImage || 'https://cdn.vuetifyjs.com/images/john.jpg'"
            alt="صورة الطالب"
            class="animate-pulse"
          ></v-img>
        </v-avatar>

        <div class="text-h4 mb-4 font-weight-bold animate-slide-up">
          {{ studentName }}
        </div>

        <v-chip
          color="success"
          class="ma-3 pa-6 animate-slide-in"
          size="x-large"
          elevation="3"
        >
          <span class="text-h5 font-weight-medium">{{ encouragementPhrase }}</span>
        </v-chip>
      </v-card-text>

      <v-card-actions class="justify-center pa-5">
        <v-btn
          color="primary"
          variant="elevated"
          @click="closeDialog"
          size="x-large"
          rounded
          class="px-8 py-3 animate-bounce-in"
          elevation="3"
        >
          <v-icon start size="large" class="animate-rotate">
            mdi-thumb-up
          </v-icon>
          <span class="text-h6">ممتاز</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentImage: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:show'])

// قائمة بعبارات التشجيع باللهجة السعودية
const encouragementPhrases = [
  "ما شاء الله عليك، مبدع يالغالي! 👏👏",
  "يا بعد حيي، شغل عدل والله! 🌟🌟",
  "فنان والله، استمر على هالمستوى! 💪💪",
  "تبارك الرحمن، مجهود خرافي! 🔥🔥",
  "الله يوفقك، شغل يفتح النفس! 👍👍",
  "ما قصرت يا بطل، كفو والله! 🏆🏆",
  "تستاهل التميز يا ذيب! 🦅🦅",
  "عسى ربي يزيدك من فضله، مبدع! 🌹🌹",
  "والله إنك قدها وقدود! 💯💯",
  "يا سلام عليك، شغل ولا أروع! ⭐⭐",
  "كفو يا بعد حيي، واصل إبداعك! 🚀🚀",
  "الله يعطيك العافية، مجهود رائع! 🌈🌈",
  "تستاهل الدرجة كاملة، ما شاء الله! 📝📝",
  "عيني عليك باردة، شغل متقن! 👌👌",
  "يا حلاة هالشغل، تبارك الرحمن! 🎯🎯",
  "من جد أنك متميز يا بطل! 👑👑",
  "والله إنك فنان يا بعد قلبي! ❤️❤️",
  "ماشاء الله عليك، مبدع ومتفوق! 🌟🌟",
  "الله يسعدك يا رب ، شغل ممتاز! 😍😍",
  "والله إنك نجم يا بطل! 🌟🌟"
]

// اختيار عبارة تشجيع عشوائية
const encouragementPhrase = ref('')

// اختيار عبارة عشوائية عند فتح النافذة
const selectRandomPhrase = () => {
  const randomIndex = Math.floor(Math.random() * encouragementPhrases.length)
  encouragementPhrase.value = encouragementPhrases[randomIndex]

  // إضافة تأثير صوتي للتشجيع
  try {
    const audio = new Audio('/sounds/success.mp3')
    audio.volume = 0.5
    audio.play()
  } catch (error) {
    console.log('تعذر تشغيل الصوت:', error)
  }

  // إضافة تأثير اهتزاز للصفحة (اختياري)
  if ('vibrate' in navigator) {
    navigator.vibrate(200)
  }
}

// إغلاق النافذة
const closeDialog = () => {
  emit('update:show', false)
}

// اختيار عبارة عشوائية عند تحميل المكون
onMounted(() => {
  selectRandomPhrase()
})

// مؤثر الكونفيتي
const showConfetti = () => {
  try {
    const duration = 3000;
    const end = Date.now() + duration;

    // مؤثر الكونفيتي الأول (من اليسار)
    const leftConfetti = confetti.create(document.createElement('canvas'), {
      resize: true,
      useWorker: true
    });
    document.body.appendChild(leftConfetti.canvas);
    leftConfetti.canvas.style.position = 'fixed';
    leftConfetti.canvas.style.width = '100%';
    leftConfetti.canvas.style.height = '100%';
    leftConfetti.canvas.style.top = '0';
    leftConfetti.canvas.style.left = '0';
    leftConfetti.canvas.style.zIndex = '1000';
    leftConfetti.canvas.style.pointerEvents = 'none';

    // مؤثر الكونفيتي الثاني (من اليمين)
    const rightConfetti = confetti.create(document.createElement('canvas'), {
      resize: true,
      useWorker: true
    });
    document.body.appendChild(rightConfetti.canvas);
    rightConfetti.canvas.style.position = 'fixed';
    rightConfetti.canvas.style.width = '100%';
    rightConfetti.canvas.style.height = '100%';
    rightConfetti.canvas.style.top = '0';
    rightConfetti.canvas.style.left = '0';
    rightConfetti.canvas.style.zIndex = '1000';
    rightConfetti.canvas.style.pointerEvents = 'none';

    const animateConfetti = () => {
      const now = Date.now();
      const remaining = end - now;
      if (remaining <= 0) {
        // إزالة الكانفاس بعد انتهاء المؤثر
        leftConfetti.canvas.remove();
        rightConfetti.canvas.remove();
        return;
      }

      // مؤثر من اليسار
      leftConfetti({
        particleCount: 2,
        startVelocity: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#26a69a', '#00897b', '#004d40', '#80cbc4', '#4db6ac'],
      });

      // مؤثر من اليمين
      rightConfetti({
        particleCount: 2,
        startVelocity: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#1976d2', '#0d47a1', '#2196f3', '#64b5f6', '#42a5f5'],
      });

      requestAnimationFrame(animateConfetti);
    };

    animateConfetti();
  } catch (error) {
    console.error('خطأ في تشغيل مؤثر الكونفيتي:', error);
  }
};

// اختيار عبارة عشوائية في كل مرة تفتح فيها النافذة
watch(() => props.show, (newValue) => {
  if (newValue) {
    selectRandomPhrase()
    // تشغيل مؤثر الكونفيتي عند فتح النافذة
    setTimeout(() => {
      showConfetti()
    }, 300)
  }
}, { immediate: true })
</script>

<style scoped>
.encouragement-card {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  animation: card-appear 0.5s ease-out;
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.v-theme--dark .encouragement-card {
  background-color: rgb(var(--v-theme-surface));
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* تنسيقات إضافية للعناصر */
.v-chip {
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.v-btn {
  font-weight: bold;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(var(--v-theme-primary), 0.3) !important;
}

.v-avatar {
  border: 4px solid rgba(var(--v-theme-success), 0.3);
  transition: all 0.3s ease;
}

.v-avatar:hover {
  transform: scale(1.05);
}

/* المؤثرات الحركية */
.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scaleIn 0.8s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  80% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(var(--v-theme-success), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 1s ease-out;
}

@keyframes slideIn {
  0% {
    transform: translateX(50px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounceIn 1s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-rotate {
  animation: rotate 1.5s ease-in-out infinite;
  transform-origin: center;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-15deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
