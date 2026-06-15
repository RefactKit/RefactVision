import { betterAuth } from 'better-auth'

betterAuth({
  databaseHooks: {
    user: {
      create: {
        after: async (data) => {
          console.log(data.id)
        },
      },
    },
  },
})
