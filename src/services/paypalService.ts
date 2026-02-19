// PayPal Subscription Service
export interface PayPalSubscription {
  subscriptionID: string;
  status: string;
  startTime: string;
  endTime?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  currency: string;
  interval: string;
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'student-plan', // WhatsApp only
    name: 'طالب',
    price: '50',
    currency: 'MAD',
    interval: 'monthly'
  },
  {
    id: 'judge-plan', // WhatsApp only
    name: 'قاضٍ متدرب',
    price: '150',
    currency: 'MAD',
    interval: 'monthly'
  },
  {
    id: 'P-5BJ40047EK8744830NGLHTLA',
    name: 'محامٍ',
    price: '500',
    currency: 'MAD',
    interval: 'monthly'
  }
];

export const getPlan = (key: string) => {
  // Support aliases for easier lookup
  const aliases: Record<string, string> = {
    'lawyer': 'محامٍ',
    'student': 'طالب',
    'judge': 'قاضٍ'
  };

  const searchKey = aliases[key.toLowerCase()] || key;
  return SUBSCRIPTION_PLANS.find(p =>
    p.name.includes(searchKey) ||
    p.id.includes(key) ||
    p.id === key
  );
};

// Check if user has active subscription
export const hasActiveSubscription = (): boolean => {
  const subscription = localStorage.getItem('paypalSubscription');
  if (!subscription) return false;

  try {
    const subData: PayPalSubscription = JSON.parse(subscription);
    const now = new Date();
    const endTime = subData.endTime ? new Date(subData.endTime) : null;

    // If no end time, assume it's active (PayPal handles renewals)
    if (!endTime) return true;

    return endTime > now;
  } catch {
    return false;
  }
};

// Save subscription data
export const saveSubscription = (subscriptionData: PayPalSubscription): void => {
  localStorage.setItem('paypalSubscription', JSON.stringify(subscriptionData));
};

// Get subscription data
export const getSubscription = (): PayPalSubscription | null => {
  const subscription = localStorage.getItem('paypalSubscription');
  if (!subscription) return null;

  try {
    return JSON.parse(subscription);
  } catch {
    return null;
  }
};

// Clear subscription data (for logout or cancellation)
export const clearSubscription = (): void => {
  localStorage.removeItem('paypalSubscription');
}; 