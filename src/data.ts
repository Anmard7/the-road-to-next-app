const initialTickets = [
    {
        id: "1",
        title: "Ticket 1",
        content: "Ticket 1 description.",
        status: "DONE" as const,
    },
    {
        id: "2",
        title: "Ticket 2",
        content: "This is the second ticket.",
        status: "OPEN" as const,
    },
    {
        id: "3",
        title: "Ticket 3",
        content: "This is the second ticket.",
        status: "IN_PROGRESS" as const,
    },
]

export default initialTickets;