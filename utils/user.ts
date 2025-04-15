// utils/user.ts
export function getAnonymousUserId(): string {
    let userId = localStorage.getItem('anon_user_id')
    if (!userId) {
        userId = crypto.randomUUID()
        localStorage.setItem('anon_user_id', userId)
    }
    return userId
}