// Mock data for testing the delivery boy app
export const mockAvailableOrders = [
    {
        _id: "674a1b2c3d4e5f6789012345",
        customer: {
            name: "Rajesh Kumar",
            phone: "+91 9876543210",
            email: "rajesh@example.com"
        },
        deliveryAddress: "123 MG Road, Bangalore, Karnataka 560001",
        items: [
            {
                name: "Chicken Biryani",
                quantity: 2,
                price: 250,
                shopName: "Biryani House"
            },
            {
                name: "Raita",
                quantity: 1,
                price: 50,
                shopName: "Biryani House"
            }
        ],
        totalAmount: 550,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        distance: 2.5,
        estimatedTime: 15
    },
    {
        _id: "674a1b2c3d4e5f6789012346",
        customer: {
            name: "Priya Sharma",
            phone: "+91 9876543211",
            email: "priya@example.com"
        },
        deliveryAddress: "456 Brigade Road, Bangalore, Karnataka 560025",
        items: [
            {
                name: "Margherita Pizza",
                quantity: 1,
                price: 350,
                shopName: "Pizza Corner"
            },
            {
                name: "Garlic Bread",
                quantity: 1,
                price: 120,
                shopName: "Pizza Corner"
            }
        ],
        totalAmount: 470,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        distance: 1.8,
        estimatedTime: 12
    }
];

export const mockActiveDeliveries = [
    {
        _id: "674a1b2c3d4e5f6789012347",
        customer: {
            name: "Amit Patel",
            phone: "+91 9876543212",
            email: "amit@example.com"
        },
        deliveryAddress: "789 Koramangala, Bangalore, Karnataka 560034",
        items: [
            {
                name: "Masala Dosa",
                quantity: 2,
                price: 80,
                shopName: "South Indian Cafe"
            },
            {
                name: "Filter Coffee",
                quantity: 2,
                price: 40,
                shopName: "South Indian Cafe"
            }
        ],
        totalAmount: 240,
        status: "assigned",
        assignedAt: new Date().toISOString(),
        tips: 0
    }
];

export const mockEarnings = {
    todayEarnings: 450,
    weeklyEarnings: 2800,
    monthlyEarnings: 12500,
    totalEarnings: 45600,
    todayDeliveries: 8,
    weeklyDeliveries: 42,
    monthlyDeliveries: 186
};

// Function to use mock data in development
export const useMockData = () => {
    return process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true';
};