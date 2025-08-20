export enum EGuildRoles {
  GUILD_MASTER = 'Guild Master', // Le chef de la guilde
  OFFICER = 'Officer', // Un officier de la guilde
  MEMBER = 'Member', // Un membre de la guilde
}

export enum EGuildStatus {
  ACTIVE = 'ACTIVE', // Est un membre actif de la guilde
  PENDING = 'PENDING', // A postulé pour rejoindre la guilde
  INVITED = 'INVITED', // Sa demande a été acceptée, mais il n'a pas encore rejoint
  REJECTED = 'REJECTED', // Sa demande a été refusée
}
