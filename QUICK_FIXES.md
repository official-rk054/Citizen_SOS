# Quick Fix Implementation Guide

## 🔴 CRITICAL FIXES - DO THESE FIRST

### Fix #1: Volunteers API (5 minutes)

**File**: `frontend/utils/api.ts`

Replace line 47:

```typescript
// OLD:
// (Missing implementation)

// NEW:
getNearbyVolunteers: async (
  latitude: number,
  longitude: number,
  radius: number = 10
) => api.get('/users/nearby/volunteers', { params: { latitude, longitude, radius } }),
```

**File**: `frontend/app/(tabs)/index.tsx`

Replace line 137:

```typescript
// OLD:
usersAPI.getNearbyVolunteers?.(location.latitude, location.longitude, 10)
  .catch(() => ({ data: [] })),

// NEW:
usersAPI.getNearbyVolunteers(location.latitude, location.longitude, 10)
  .catch(() => ({ data: [] })),
```

**Verify**: Backend endpoint already exists ✅ at `backend/routes/users.js` line 114

---

### Fix #2: Payment Methods Connection (30 minutes)

**File**: `frontend/app/settings/payment.tsx`

Add at the top (after imports):

```typescript
import { usersAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "react-native";
```

Add state variables:

```typescript
const { user } = useAuth();
const [paymentMethods, setPaymentMethods] = useState([]);
const [loading, setLoading] = useState(false);

// For form fields
const [expiryMonth, setExpiryMonth] = useState("");
const [expiryYear, setExpiryYear] = useState("");
```

Add useEffect:

```typescript
useEffect(() => {
  if (user?.id) {
    fetchPaymentMethods();
  }
}, [user?.id]);

const fetchPaymentMethods = async () => {
  try {
    const response = await usersAPI.getPaymentMethods(user!.id);
    setPaymentMethods(response.data || []);
  } catch (error) {
    console.error("Error fetching payments:", error);
  }
};
```

Replace `handleAddPayment`:

```typescript
const handleAddPayment = async () => {
  if (!cardNumber || !holderName || !expiryMonth || !expiryYear) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  setLoading(true);
  try {
    const paymentData = {
      type: paymentType,
      cardHolderName: holderName,
      cardLast4: cardNumber.slice(-4),
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      isDefault: false,
    };

    const response = await usersAPI.addPaymentMethod(user!.id, paymentData);
    setPaymentMethods([...paymentMethods, response.data]);
    setShowAddModal(false);
    setCardNumber("");
    setHolderName("");
    setExpiryMonth("");
    setExpiryYear("");
    Alert.alert("Success", "Payment method added");
  } catch (error) {
    console.error("Error:", error);
    Alert.alert("Error", "Failed to add payment method");
  } finally {
    setLoading(false);
  }
};
```

Add delete handler:

```typescript
const handleDeletePayment = async (methodId: string) => {
  Alert.alert("Delete", "Remove this payment method?", [
    { text: "Cancel" },
    {
      text: "Delete",
      onPress: async () => {
        try {
          await usersAPI.deletePaymentMethod(user!.id, methodId);
          setPaymentMethods(paymentMethods.filter((p) => p._id !== methodId));
          Alert.alert("Deleted", "Payment method removed");
        } catch (error) {
          Alert.alert("Error", "Failed to delete");
        }
      },
    },
  ]);
};
```

**Verify**: Backend API ready ✅ in `backend/routes/profile.js`

---

### Fix #3: Socket.io Nurse Notifications (15 minutes)

**File**: `frontend/app/emergency/tracking.tsx`

Update the `setupSocket` function (around line 115):

```typescript
const setupSocket = () => {
  socketRef.current = io(SOCKET_URL);

  // EXISTING LISTENERS (keep these)
  socketRef.current.on("ambulance-update", (data: any) => {
    if (data.emergencyId === emergencyId) {
      setEmergency((prev: any) => ({ ...prev, ...data }));
    }
  });

  socketRef.current.on("emergency-update", (data: any) => {
    if (data.emergencyId === emergencyId) {
      setEmergency((prev: any) => ({ ...prev, ...data }));
    }
  });

  // ADD THESE NEW LISTENERS:
  socketRef.current.on("nurse-alert", (data: any) => {
    console.log("Nurse alert received:", data);
    if (data.emergencyId === emergencyId) {
      setNotifiedNurses(data.nurseIds || []);
      // Optional: Show toast notification
      Alert.alert(
        "Nurses Notified",
        `${data.nurseIds?.length || 0} nurse(s) have been alerted`
      );
    }
  });

  socketRef.current.on("direct-nurse-alert", (data: any) => {
    if (data.emergencyId === emergencyId) {
      Alert.alert(
        "Emergency Response",
        "Nearby nurses are responding to your location"
      );
    }
  });

  socketRef.current.on("responder-calling", (data: any) => {
    if (data.emergencyId === emergencyId) {
      Alert.alert("Incoming Call", `${data.responderName} is calling...`);
    }
  });
};
```

**Verify**: Backend already emits these ✅ in `backend/server.js`

---

## 🟡 MEDIUM PRIORITY FIXES

### Fix #4: Order History Display (20 minutes)

**File**: `frontend/app/settings/orders.tsx`

Complete implementation:

```typescript
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { usersAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      const response = await usersAPI.getOrderHistory(user!.id);
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      completed: "#4CAF50",
      pending: "#FF9800",
      failed: "#F44336",
      refunded: "#2196F3",
    };
    return colors[status] || "#999";
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id?.slice(-8)}</Text>
        <Text
          style={[styles.orderStatus, { color: getStatusColor(item.status) }]}
        >
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.transactionDate).toLocaleDateString()}{" "}
        {new Date(item.transactionDate).toLocaleTimeString()}
      </Text>
      <Text style={styles.orderType}>{item.type?.toUpperCase()}</Text>
      <Text style={styles.orderAmount}>₹{item.amount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Order History</Text>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item, index) => item._id || index.toString()}
            scrollEnabled={false}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#1A1A1A" },
  listContainer: { flex: 1, paddingHorizontal: 16, paddingVertical: 12 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: { fontSize: 14, fontWeight: "600", color: "#333" },
  orderStatus: { fontSize: 12, fontWeight: "700" },
  orderDate: { fontSize: 12, color: "#666", marginVertical: 4 },
  orderType: { fontSize: 11, color: "#999", marginVertical: 4 },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
    marginVertical: 8,
  },
  emptyText: { textAlign: "center", padding: 32, color: "#999", fontSize: 16 },
});
```

---

### Fix #5: Transactions History (20 minutes)

Same pattern as Orders - create `frontend/app/settings/contact.tsx` if needed.

```typescript
// Just modify the API call:
const fetchTransactions = async () => {
  const response = await usersAPI.getTransactionHistory(user!.id);
  setTransactions(response.data || []);
};
```

---

## 🟢 QUICK VERIFICATION CHECKLIST

After each fix, verify:

```bash
# 1. Check backend is running
curl http://localhost:5000/api/users/nearby/professionals/doctor

# 2. Check frontend can reach backend
# Open browser console in React Native and look for network requests

# 3. Check error logs
# Backend: check terminal for errors
# Frontend: check React Native console

# 4. Test the feature
# Use the app to trigger the fixed feature
```

---

## 🚨 COMMON ERRORS & SOLUTIONS

### Error: "Cannot read property 'getNearbyVolunteers' of undefined"

**Cause**: API not exported properly
**Fix**: Check `frontend/utils/api.ts` exports the function

### Error: "Network Error: 404 Not Found"

**Cause**: Backend endpoint doesn't exist or wrong path
**Fix**: Verify backend route exists and check path spelling

### Error: "Socket is not connected"

**Cause**: Backend not running or CORS issue
**Fix**:

1. Start backend: `npm run dev`
2. Check CORS in `backend/server.js`

### Error: "Token expired or invalid"

**Cause**: Auth token not being sent
**Fix**: Check `frontend/utils/api.ts` interceptor is working

---

## 📝 TESTING EACH FIX

### Test Volunteers API

```javascript
// In browser console or Postman:
GET http://localhost:5000/api/users/nearby/professionals/volunteer?latitude=40.7128&longitude=-74.0060&radius=10
// Should return array of volunteers
```

### Test Payment Methods

```javascript
// After adding payment method:
GET http://localhost:5000/api/users/{userId}/payment-methods
// Should return array with your new payment
```

### Test Socket.io

```javascript
// In browser console:
io("http://localhost:5000").on("nurse-alert", (data) => {
  console.log("Received:", data);
});
// Trigger SOS and check console
```

---

## 🎓 LEARNING RESOURCES

- **Fix #1-3**: Basic API integration
- **Fix #4-5**: List rendering with data
- **Socket.io**: Real-time events handling
- **Error Handling**: Try/catch and Alert components

---

## ✅ IMPLEMENTATION CHECKLIST

```
[ ] Fix #1 - Volunteers API (5 min)
[ ] Fix #2 - Payment Methods (30 min)
[ ] Fix #3 - Socket.io Nurses (15 min)
[ ] Fix #4 - Order History (20 min)
[ ] Fix #5 - Transactions History (20 min)

Total Time: ~90 minutes
Complexity: Easy to Medium
```

Start with Fix #1 - it's the quickest and easiest!
