import { TrelloCard } from "../services/authorization.service";

export interface CheckListProgress {
  total: number;
  completed: number;
  percentage: number;
}

// Calcular progreso de checklist
export function getChecklistProgress(card: TrelloCard): CheckListProgress {
  if (!card.badges) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const total = card.badges.checkItems || 0;
  const completed = card.badges.checkItemsChecked || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

// Obtener prioridad basada en etiquetas (asumiendo un sistema de colores)
export function getCardPriority(
  card: TrelloCard
): 'high' | 'medium' | 'low' | 'none' {
  if (!card.labels || card.labels.length === 0) {
    return 'none';
  }

  // Mapeo de colores a prioridades (puedes personalizar esto)
  const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
    red: 'high',
    orange: 'high',
    yellow: 'medium',
    blue: 'medium',
    green: 'low',
    purple: 'low',
  };

  // Buscar la prioridad más alta entre las etiquetas
  for (const label of card.labels) {
    if (label.color && priorityMap[label.color]) {
      if (priorityMap[label.color] === 'high') return 'high';
    }
  }

  for (const label of card.labels) {
    if (label.color && priorityMap[label.color]) {
      if (priorityMap[label.color] === 'medium') return 'medium';
    }
  }

  for (const label of card.labels) {
    if (label.color && priorityMap[label.color]) {
      if (priorityMap[label.color] === 'low') return 'low';
    }
  }

  return 'none';
}

// Verificar si una tarjeta está vencida
export function isCardOverdue(card: TrelloCard): boolean {
  if (!card.due) return false;
  if (card.dueComplete) return false;

  const dueDate = new Date(card.due);
  const now = new Date();

  return dueDate < now;
}

// Obtener días hasta el vencimiento
export function getDaysUntilDue(card: TrelloCard): number | null {
  if (!card.due) return null;

  const dueDate = new Date(card.due);
  const now = new Date();

  // Calcular diferencia en días
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Obtener estado de la tarjeta basado en múltiples factores
export function getCardStatus(card: TrelloCard): {
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  progress: number;
  priority: 'high' | 'medium' | 'low' | 'none';
  daysUntilDue: number | null;
  isOverdue: boolean;
} {
  const progress = getChecklistProgress(card);
  const priority = getCardPriority(card);
  const daysUntilDue = getDaysUntilDue(card);
  const isOverdue = isCardOverdue(card);

  let status: 'completed' | 'in-progress' | 'pending' | 'overdue' = 'pending';

  if (isOverdue) {
    status = 'overdue';
  } else if (progress.percentage === 100 || card.dueComplete) {
    status = 'completed';
  } else if (progress.percentage > 0) {
    status = 'in-progress';
  }

  return {
    status,
    progress: progress.percentage,
    priority,
    daysUntilDue,
    isOverdue,
  };
}

// Obtener resumen de actividad reciente
export function getActivitySummary(card: TrelloCard): {
  lastActivity: Date;
  daysSinceActivity: number;
  hasRecentActivity: boolean;
} {
  const lastActivity = new Date(card.dateLastActivity);
  const now = new Date();
  const diffTime = now.getTime() - lastActivity.getTime();
  const daysSinceActivity = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hasRecentActivity = daysSinceActivity <= 7; // Actividad en los últimos 7 días

  return {
    lastActivity,
    daysSinceActivity,
    hasRecentActivity,
  };
}

// Obtener estadísticas de miembros
export function getMemberStats(card: TrelloCard): {
  totalMembers: number;
  memberNames: string[];
  hasAssignedMembers: boolean;
} {
  const totalMembers = card.members?.length || 0;
  const memberNames = card.members?.map((m) => m.fullName || m.username) || [];
  const hasAssignedMembers = totalMembers > 0;

  return {
    totalMembers,
    memberNames,
    hasAssignedMembers,
  };
}

// Filtrar tarjetas por criterios múltiples
export function filterCards(
  cards: TrelloCard[],
  filters: {
    priority?: 'high' | 'medium' | 'low' | 'none';
    status?: 'completed' | 'in-progress' | 'pending' | 'overdue';
    hasMembers?: boolean;
    hasDueDate?: boolean;
    isOverdue?: boolean;
    labelColors?: string[];
    memberId?: string;
  }
): TrelloCard[] {
  return cards.filter((card) => {
    const cardStatus = getCardStatus(card);
    const memberStats = getMemberStats(card);

    // Filtro por prioridad
    if (filters.priority && cardStatus.priority !== filters.priority) {
      return false;
    }

    // Filtro por estado
    if (filters.status && cardStatus.status !== filters.status) {
      return false;
    }

    // Filtro por miembros asignados
    if (
      filters.hasMembers !== undefined &&
      memberStats.hasAssignedMembers !== filters.hasMembers
    ) {
      return false;
    }

    // Filtro por fecha de vencimiento
    if (filters.hasDueDate !== undefined && !!card.due !== filters.hasDueDate) {
      return false;
    }

    // Filtro por vencimiento
    if (
      filters.isOverdue !== undefined &&
      cardStatus.isOverdue !== filters.isOverdue
    ) {
      return false;
    }

    // Filtro por colores de etiquetas
    if (filters.labelColors && filters.labelColors.length > 0) {
      const cardLabelColors =
        card.labels?.map((l) => l.color).filter(Boolean) || [];
      const hasMatchingLabel = filters.labelColors.some((color) =>
        cardLabelColors.includes(color as "red" | "orange" | "yellow" | "blue" | "green" | "purple" | "black" | "sky" | "pink" | "lime" | null)
      );
      if (!hasMatchingLabel) {
        return false;
      }
    }

    // Filtro por miembro específico
    if (filters.memberId) {
      const hasMember = card.idMembers?.includes(filters.memberId) || false;
      if (!hasMember) {
        return false;
      }
    }

    return true;
  });
}

// Ordenar tarjetas por diferentes criterios
export function sortCards(
  cards: TrelloCard[],
  sortBy: 'priority' | 'dueDate' | 'progress' | 'activity' | 'position'
): TrelloCard[] {
  return [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
        const aPriority = getCardPriority(a);
        const bPriority = getCardPriority(b);
        return priorityOrder[aPriority] - priorityOrder[bPriority];

      case 'dueDate':
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return new Date(a.due).getTime() - new Date(b.due).getTime();

      case 'progress':
        const aProgress = getChecklistProgress(a).percentage;
        const bProgress = getChecklistProgress(b).percentage;
        return bProgress - aProgress;

      case 'activity':
        return (
          new Date(b.dateLastActivity).getTime() -
          new Date(a.dateLastActivity).getTime()
        );

      case 'position':
        return a.pos - b.pos;

      default:
        return 0;
    }
  });
}
