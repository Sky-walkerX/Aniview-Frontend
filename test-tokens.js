import { decodeJwtPayload, getUserIdFromToken, isTokenExpired } from '../src/lib/token-utils'

// Test tokens from registration
const token1 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI4ZTY5ZjllYy0yYTg2LTQ5YzAtYmQ2MC01ZjcwZmFlZjNlYTIiLCJleHAiOjE3NTY1OTEyNzQsImlhdCI6MTc1NjU4NzY3NH0.hHP7vDDSPk7YT5qCsFHw4Y0EEiSGvRlIAPsQtOnHZm0"
const token2 = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxYTEyMzc2Mi0wNTM4LTRiOTMtOWE2Yi01MzhhMmRlNjYxNTciLCJleHAiOjE3NTY1OTEyODcsImlhdCI6MTc1NjU4NzY4N30.tNPvTcfpudlb6yJQso20LxFi6olcLD9t49Sgw-3eJMk"

console.log("=== Token Analysis ===")
console.log("Token 1 Payload:", decodeJwtPayload(token1))
console.log("Token 1 User ID:", getUserIdFromToken(token1))
console.log("Token 1 Expired:", isTokenExpired(token1))

console.log("\nToken 2 Payload:", decodeJwtPayload(token2))
console.log("Token 2 User ID:", getUserIdFromToken(token2))
console.log("Token 2 Expired:", isTokenExpired(token2))

console.log("\nTokens are different:", token1 !== token2)
console.log("User IDs are different:", getUserIdFromToken(token1) !== getUserIdFromToken(token2))
