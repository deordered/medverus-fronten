/**
 * Framer Motion Animation Variants
 * Comprehensive animation configurations for Medverus AI platform
 * Inspired by Perplexity.ai's smooth transitions with medical-specific enhancements
 */

import { Variants } from "framer-motion"

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Search interface animations
export const searchVariants: Variants = {
  collapsed: {
    scale: 0.95,
    opacity: 0.8,
    y: 10,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  expanded: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  focused: {
    scale: 1.02,
    opacity: 1,
    y: 0,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

// Sidebar panel animations
export const sidebarVariants: Variants = {
  closed: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

// Collapsible sidebar animations
export const collapsibleSidebarVariants: Variants = {
  collapsed: {
    width: "4rem",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  expanded: {
    width: "16rem",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

// Content fade-in animations
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

// Staggered list animations
export const listVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Card hover animations
export const cardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
}

// Button press animations
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.05,
      ease: "easeOut"
    }
  }
}

// Medical-specific animations
export const medicalQueryVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
    borderColor: "rgb(229, 231, 235)", // gray-200
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  processing: {
    scale: 1.02,
    opacity: 0.9,
    borderColor: "rgb(37, 99, 235)", // medical-primary
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  },
  success: {
    scale: 1,
    opacity: 1,
    borderColor: "rgb(34, 197, 94)", // green-500
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  error: {
    scale: 1,
    opacity: 1,
    borderColor: "rgb(239, 68, 68)", // red-500
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

// Progress animations
export const progressVariants: Variants = {
  loading: {
    scaleX: [0, 1, 0],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity
    }
  },
  complete: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Modal/Dialog animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 50,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Overlay animations
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

// Notification animations
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "100%",
    scale: 0.8
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    x: "100%",
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// File upload animations
export const uploadVariants: Variants = {
  idle: {
    scale: 1,
    borderStyle: "dashed",
    borderColor: "rgb(156, 163, 175)", // gray-400
    backgroundColor: "rgb(249, 250, 251)", // gray-50
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  dragOver: {
    scale: 1.02,
    borderStyle: "solid",
    borderColor: "rgb(37, 99, 235)", // medical-primary
    backgroundColor: "rgb(239, 246, 255)", // blue-50
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  uploading: {
    scale: 1,
    borderColor: "rgb(37, 99, 235)", // medical-primary
    backgroundColor: "rgb(239, 246, 255)", // blue-50
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  success: {
    scale: 1,
    borderColor: "rgb(34, 197, 94)", // green-500
    backgroundColor: "rgb(240, 253, 244)", // green-50
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Tab transition animations
export const tabVariants: Variants = {
  inactive: {
    opacity: 0.7,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  active: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

// Spring configuration presets
export const springConfig = {
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 14,
    mass: 1
  },
  medium: {
    type: "spring" as const,
    stiffness: 200,
    damping: 20,
    mass: 1
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 1
  }
}

// Easing curves
export const easingCurves = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.265, 1.55],
  ease: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1]
}