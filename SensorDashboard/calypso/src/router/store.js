export default {
    state: {
      buildings: [
        {
          id: 1,
          name: 'Building A',
          floors: [
            {
              id: 1,
              name: 'Floor 1',
              rooms: [
                { id: 1, name: "Room 101", temperature: 24, people: 5 },
                { id: 2, name: "Room 102", temperature: 22, people: 2 }
              ]
            },
            {
              id: 2,
              name: 'Floor 2',
              rooms: [
                { id: 3, name: "Room 201", temperature: 26, people: 1 }
              ]
            }
          ]
        },
      ]
    }
  }
  