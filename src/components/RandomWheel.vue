<template>
  <div class="wheel-container" ref="wheelContainer">
    <canvas ref="wheelCanvas" class="wheel-canvas"></canvas>
    <div class="wheel-center" v-if="!isSpinning && !selectedItem">
      <v-btn
        color="primary"
        size="large"
        rounded="pill"
        elevation="4"
        class="spin-button"
        @click="spinWheel"
        :disabled="items.length === 0"
      >
        <v-icon start>mdi-rotate-right</v-icon>
        {{ spinButtonText }}
      </v-btn>
    </div>
    <div class="wheel-reset" v-if="!isSpinning && selectedItem">
      <v-btn
        color="secondary"
        size="small"
        rounded="pill"
        variant="outlined"
        class="reset-button"
        @click="resetWheel"
        :disabled="items.length === 0"
      >
        <v-icon start>mdi-refresh</v-icon>
        إعادة العجلة
      </v-btn>
    </div>
    <div class="wheel-pointer">
      <v-icon icon="mdi-triangle" color="error" size="x-large"></v-icon>
    </div>
    <!-- تم إزالة عرض الطالب المختار من هنا لأنه سيظهر في الصفحة الرئيسية -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import confetti from 'canvas-confetti';
import { getInitials, getAvatarColor } from '@/utils/imageUtils';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  spinTime: {
    type: Number,
    default: 5000
  },
  spinButtonText: {
    type: String,
    default: 'اختيار'
  }
});

const emit = defineEmits(['selected']);

// References
const wheelCanvas = ref(null);
const wheelContainer = ref(null);
const ctx = ref(null);

// State
const isSpinning = ref(false);
const selectedItem = ref(null);
const rotationAngle = ref(0);
const targetAngle = ref(0);
const animationId = ref(null);
const startTime = ref(0);
const endTime = ref(0);

// Computed
const totalItems = computed(() => props.items.length);
const sliceAngle = computed(() => (2 * Math.PI) / totalItems.value);

// Colors for wheel slices
const colors = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFC107', // Amber
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#FF5722', // Deep Orange
  '#00BCD4', // Cyan
  '#3F51B5', // Indigo
  '#CDDC39', // Lime
  '#795548', // Brown
];

// Watch for changes in items
watch(() => props.items, () => {
  if (wheelCanvas.value && ctx.value) {
    drawWheel();
  }
}, { deep: true });

// Initialize wheel
onMounted(() => {
  if (wheelCanvas.value) {
    ctx.value = wheelCanvas.value.getContext('2d');
    resizeCanvas();
    drawWheel();

    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
  }
});

// Clean up
onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});

// Resize canvas to fit container
const resizeCanvas = () => {
  if (wheelContainer.value && wheelCanvas.value) {
    const size = Math.min(wheelContainer.value.clientWidth, wheelContainer.value.clientHeight) - 40;
    wheelCanvas.value.width = size;
    wheelCanvas.value.height = size;
    drawWheel();
  }
};

// Draw the wheel
const drawWheel = () => {
  if (!ctx.value || !wheelCanvas.value || totalItems.value === 0) return;

  const canvas = wheelCanvas.value;
  const context = ctx.value;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 5;

  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw wheel background
  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotationAngle.value);

  // Draw slices
  for (let i = 0; i < totalItems.value; i++) {
    const startAngle = i * sliceAngle.value;
    const endAngle = (i + 1) * sliceAngle.value;
    const color = colors[i % colors.length];

    // Draw slice
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, startAngle, endAngle);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.stroke();

    // Draw text
    context.save();
    context.rotate(startAngle + sliceAngle.value / 2);
    context.textAlign = 'right';
    context.fillStyle = '#fff';
    context.font = 'bold 14px Arial';

    // Truncate long names
    let name = props.items[i].name;
    if (name.length > 12) {
      name = name.substring(0, 10) + '...';
    }

    context.fillText(name, radius - 20, 5);
    context.restore();
  }

  // Draw center circle
  context.beginPath();
  context.arc(0, 0, radius * 0.15, 0, 2 * Math.PI);
  context.fillStyle = '#fff';
  context.fill();
  context.strokeStyle = '#333';
  context.lineWidth = 2;
  context.stroke();

  context.restore();
};

// Spin the wheel
const spinWheel = () => {
  if (isSpinning.value || totalItems.value === 0) {
    console.log('Cannot spin wheel: isSpinning =', isSpinning.value, 'totalItems =', totalItems.value);
    return;
  }

  console.log('Starting wheel spin with', totalItems.value, 'items');
  isSpinning.value = true;
  selectedItem.value = null;

  // Calculate random target angle (at least 4 full rotations + random position)
  // Reduced number of rotations but increased duration for much slower movement
  const minRotations = 4;
  const randomIndex = Math.floor(Math.random() * totalItems.value);
  const randomAngle = randomIndex * sliceAngle.value;

  console.log('Selected random index:', randomIndex, 'out of', totalItems.value, 'items');

  // Target angle calculation:
  // 1. Start from current angle
  // 2. Add minimum rotations (4 * 2π)
  // 3. Add random position angle
  // 4. Add a small offset to ensure the pointer lands in the middle of a slice
  targetAngle.value = rotationAngle.value + (minRotations * 2 * Math.PI) + randomAngle + (sliceAngle.value / 2);

  // Set animation timing - make it faster (3 seconds instead of 5)
  startTime.value = performance.now();
  endTime.value = startTime.value + (props.spinTime * 0.6); // 60% of the original duration

  // Start animation
  animateWheel();
};

// Animate the wheel spinning
const animateWheel = () => {
  const now = performance.now();
  const elapsed = now - startTime.value;
  const duration = endTime.value - startTime.value;

  // Calculate progress (0 to 1)
  let progress = Math.min(elapsed / duration, 1);

  // Custom easing function for faster and smoother movement
  // First 40% of time - quick acceleration
  // Last 60% of time - gradual deceleration
  if (progress < 0.4) {
    // Quick start - cubic ease-in: progress = progress^3
    progress = progress * 0.4 / 0.4; // Normalize to 0-1 range
    progress = Math.pow(progress, 3) * 0.4; // Scale back to 0-0.4 range
  } else {
    // Gradual end - custom ease-out
    progress = (progress - 0.4) * 0.6 / 0.6; // Normalize to 0-1 range
    progress = 0.4 + 0.6 * (1 - Math.pow(1 - progress, 3)); // Scale back to 0.4-1 range
  }

  // Calculate current rotation
  const currentAngle = rotationAngle.value + (targetAngle.value - rotationAngle.value) * progress;
  rotationAngle.value = currentAngle;

  // Draw the wheel
  drawWheel();

  // Continue animation or finish
  if (progress < 1) {
    animationId.value = requestAnimationFrame(animateWheel);
  } else {
    finishSpin();
  }
};

// Finish spinning and show result
const finishSpin = () => {
  // Check if we have items to select from
  if (totalItems.value === 0 || !props.items || props.items.length === 0) {
    console.error('No items to select from');
    isSpinning.value = false;
    return;
  }

  // Calculate which item is selected
  const normalizedAngle = rotationAngle.value % (2 * Math.PI);
  const itemIndex = Math.floor(totalItems.value - (normalizedAngle / sliceAngle.value)) % totalItems.value;

  // Make sure we have a valid index
  const validIndex = (itemIndex >= 0 && itemIndex < props.items.length) ? itemIndex : 0;

  // Set the selected item
  selectedItem.value = props.items[validIndex];

  console.log('Selected student:', selectedItem.value.name, 'at index', validIndex);

  // Finish spinning
  isSpinning.value = false;

  // Emit selected item with a small delay to ensure reactivity
  console.log('Emitting selected student to parent:', selectedItem.value);

  // Emit the event immediately and log it
  console.log('EMITTING SELECTED STUDENT NOW:', selectedItem.value);
  emit('selected', selectedItem.value);

  // Also emit it again after a short delay to ensure it's caught
  setTimeout(() => {
    console.log('EMITTING SELECTED STUDENT AGAIN AFTER DELAY:', selectedItem.value);
    emit('selected', selectedItem.value);
  }, 100);

  // And again after a longer delay
  setTimeout(() => {
    console.log('EMITTING SELECTED STUDENT FINAL TIME AFTER LONGER DELAY:', selectedItem.value);
    emit('selected', selectedItem.value);
  }, 500);

  // Trigger confetti
  if (wheelContainer.value) {
    try {
      const canvasConfetti = confetti.create(wheelCanvas.value, {
        resize: true,
        useWorker: true
      });

      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Error creating confetti:', error);
    }
  }
};

// Reset the wheel
const resetWheel = () => {
  console.log('Resetting wheel');
  selectedItem.value = null;
  isSpinning.value = false;
  console.log('Wheel reset complete, selectedItem:', selectedItem.value);

  // Emit selected item as null to notify parent
  emit('selected', null);

  // Redraw the wheel to ensure it's visible
  setTimeout(() => {
    drawWheel();
  }, 100);
};

// Expose methods
defineExpose({
  spinWheel,
  resetWheel
});
</script>

<style scoped>
.wheel-container {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
}

.wheel-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.wheel-reset {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.wheel-pointer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  z-index: 5;
}

.selected-student-container {
  max-width: 400px;
  margin: 0 auto;
}

.result-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2), 0 0 30px rgba(var(--v-theme-primary), 0.2);
  animation: pulse 2s infinite;
  transform-origin: center;
  animation: scaleIn 0.5s ease-out;
}

.student-image-container {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 3px solid #1976d2;
}

.student-result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.student-image-container:hover .student-result-image {
  transform: scale(1.05);
}

.spin-button {
  min-width: 120px;
  min-height: 50px;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

.reset-button {
  min-width: 100px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.reset-button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
