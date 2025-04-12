export enum EGuildRoles {
  GUILD_MASTER = 'GUILD_MASTER', // Le chef de la guilde
  OFFICIER = 'OFFICIER', // Un officier de la guilde
  MEMBER = 'MEMBER', // Un membre de la guilde
  APPLICANT = 'APPLICANT', // Un candidat à la guilde
}

export enum EGuildStatus {
  ACTIVE = 'ACTIVE', // Est un membre actif de la guilde
  PENDING = 'PENDING', // A postulé pour rejoindre la guilde
  INVITED = 'INVITED', // Sa demande a été acceptée, mais il n'a pas encore rejoint
  REJECTED = 'REJECTED', // Sa demande a été refusée
}
