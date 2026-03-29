import { QueueEntry, Service, Barber, Booking } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function transformQueueEntry(entry: any, locale = 'derja'): QueueEntry {
  return {
    _id: entry.id ?? entry._id,
    shop: entry.shopId ?? entry.shop,
    client: entry.clientId ?? entry.client,
    clientName: entry.clientName,
    barber: entry.barberId ?? entry.barber,
    barberName: entry.barber?.user?.name ?? entry.barberName,
    service: entry.serviceId ?? entry.service,
    serviceName: entry.service
      ? (locale === 'derja' ? entry.service.nameDerja : entry.service.nameFr)
      : entry.serviceName,
    position: entry.position,
    status: entry.status,
    estimatedWait: entry.estimatedWaitMin ?? entry.estimatedWait ?? 0,
    checkedInAt: entry.checkedInAt,
    startedAt: entry.startedAt,
    completedAt: entry.completedAt,
    isWalkIn: entry.type === 'WALK_IN' || entry.isWalkIn || false,
    createdAt: entry.createdAt ?? entry.checkedInAt ?? '',
  };
}

export function transformService(service: any, locale = 'derja'): Service {
  return {
    _id: service.id ?? service._id,
    shop: service.shopId ?? service.shop,
    name: service.nameDerja ?? service.name,
    nameFr: service.nameFr,
    price: service.price,
    duration: service.durationMin ?? service.duration,
    isActive: service.isActive,
  };
}

export function transformBarber(barber: any): Barber {
  return {
    _id: barber.id ?? barber._id,
    name: barber.user?.name ?? barber.name,
    phone: barber.user?.phone ?? barber.phone,
    shop: barber.shopId ?? barber.shop,
    commissionRate: barber.commissionRate,
    isAvailable: barber.isAvailable,
    createdAt: barber.createdAt ?? '',
  };
}

export function transformBooking(booking: any, locale = 'derja'): Booking {
  return {
    _id: booking.id ?? booking._id,
    shop: booking.shopId ?? booking.shop,
    client: booking.clientId ?? booking.client,
    clientName: booking.client?.name ?? booking.clientName ?? '',
    clientPhone: booking.client?.phone ?? booking.clientPhone ?? '',
    barber: booking.barberId ?? booking.barber,
    barberName: booking.barber?.user?.name ?? booking.barberName,
    service: booking.serviceId ?? booking.service,
    serviceName: booking.service
      ? (typeof booking.service === 'string'
        ? booking.serviceName
        : (locale === 'derja' ? booking.service.nameDerja : booking.service.nameFr))
      : booking.serviceName,
    date: booking.date,
    timeSlot: booking.timeSlot,
    status: booking.status,
    depositAmount: booking.depositAmount ?? 0,
    depositPaid: booking.depositPaid ?? false,
    createdAt: booking.createdAt ?? '',
  };
}
