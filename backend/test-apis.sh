#!/bin/bash

# DNA Healthcare App - Setup Verification Script
# This script tests all map-related APIs

echo "=================================="
echo "DNA Healthcare App - API Test Suite"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
BASE_URL="http://localhost:5000/api"

# Test coordinates (Delhi, India)
TEST_LAT=28.6139
TEST_LON=77.2090
RADIUS=10

echo -e "${YELLOW}Testing Backend API Endpoints...${NC}\n"

# Test 1: Check backend is running
echo "Test 1: Backend Connection"
if curl -s "$BASE_URL/users" &> /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "  Start backend with: cd backend && npm start"
    exit 1
fi
echo ""

# Test 2: Get nearby doctors
echo "Test 2: Nearby Doctors"
echo "URL: GET $BASE_URL/users/nearby/professionals/doctor?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS"
RESPONSE=$(curl -s "$BASE_URL/users/nearby/professionals/doctor?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS")
COUNT=$(echo "$RESPONSE" | grep -o '"_id"' | wc -l)
if [ $COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT nearby doctors${NC}"
else
    echo -e "${YELLOW}⚠ No nearby doctors found (may need test data)${NC}"
fi
echo ""

# Test 3: Get nearby nurses
echo "Test 3: Nearby Nurses"
echo "URL: GET $BASE_URL/users/nearby/professionals/nurse?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS"
RESPONSE=$(curl -s "$BASE_URL/users/nearby/professionals/nurse?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS")
COUNT=$(echo "$RESPONSE" | grep -o '"_id"' | wc -l)
if [ $COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT nearby nurses${NC}"
else
    echo -e "${YELLOW}⚠ No nearby nurses found (may need test data)${NC}"
fi
echo ""

# Test 4: Get nearby ambulances
echo "Test 4: Nearby Ambulances"
echo "URL: GET $BASE_URL/users/nearby/ambulances?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS"
RESPONSE=$(curl -s "$BASE_URL/users/nearby/ambulances?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS")
COUNT=$(echo "$RESPONSE" | grep -o '"_id"' | wc -l)
if [ $COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT nearby ambulances${NC}"
else
    echo -e "${YELLOW}⚠ No nearby ambulances found (may need test data)${NC}"
fi
echo ""

# Test 5: Get nearby volunteers
echo "Test 5: Nearby Volunteers"
echo "URL: GET $BASE_URL/users/nearby/volunteers?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS"
RESPONSE=$(curl -s "$BASE_URL/users/nearby/volunteers?latitude=$TEST_LAT&longitude=$TEST_LON&radius=$RADIUS")
COUNT=$(echo "$RESPONSE" | grep -o '"_id"' | wc -l)
if [ $COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ Found $COUNT nearby volunteers${NC}"
else
    echo -e "${YELLOW}⚠ No nearby volunteers found (may need test data)${NC}"
fi
echo ""

# Test 6: Validate geolocation
echo "Test 6: Geolocation Validation"
echo "Testing invalid coordinates..."
RESPONSE=$(curl -s "$BASE_URL/users/nearby/professionals/doctor?latitude=91&longitude=200&radius=$RADIUS")
if echo "$RESPONSE" | grep -q "Invalid"; then
    echo -e "${GREEN}✓ Invalid coordinates properly rejected${NC}"
else
    echo -e "${YELLOW}⚠ Geolocation validation check${NC}"
fi
echo ""

echo "=================================="
echo "API Test Complete"
echo "=================================="
echo ""
echo "Next Steps:"
echo "1. If tests show 0 results, add test data to MongoDB"
echo "2. Use MongoDB Compass to add users with latitude/longitude"
echo "3. Ensure users have isAvailable: true"
echo "4. Run frontend: cd frontend && npm start"
echo ""
