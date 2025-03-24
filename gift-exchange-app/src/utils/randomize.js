function randomizeParticipants(participants) {
    const shuffled = participants.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const assignments = {};
    for (let i = 0; i < participants.length; i++) {
        const giver = participants[i];
        const receiver = shuffled[i === participants.length - 1 ? 0 : i + 1];
        assignments[giver] = receiver;
    }

    return assignments;
}

export default randomizeParticipants;