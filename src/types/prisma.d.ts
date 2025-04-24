declare module "@prisma/client" {
  interface UserWhereUniqueInput {
    isActive?: boolean; // Add isActive as an optional filter
  }
}
