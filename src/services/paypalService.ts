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
    id: 'P-5KC56405L5407803HNBZQTIY',
    name: 'Pro Monthly',
    price: '400',
    currency: 'MAD',
    interval: 'monthly'
  }
];

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