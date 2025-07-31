// Comprehensive audit logging system for HIPAA compliance and security monitoring
// Implements structured logging with severity levels and secure storage

interface AuditLogEntry {
  event: string
  severity: 'info' | 'warning' | 'high' | 'critical'
  timestamp?: string
  details: Record<string, any>
  metadata?: {
    requestId?: string
    sessionId?: string
    traceId?: string
  }
}

interface LogDestination {
  name: string
  enabled: boolean
  minSeverity: string
}

export class AuditLogger {
  private logQueue: AuditLogEntry[] = []
  private isProcessing = false
  private destinations: LogDestination[] = [
    { name: 'console', enabled: true, minSeverity: 'info' },
    { name: 'file', enabled: true, minSeverity: 'warning' },
    { name: 'database', enabled: true, minSeverity: 'high' },
    { name: 'siem', enabled: false, minSeverity: 'critical' }
  ]

  // Severity levels for comparison
  private severityLevels = {
    'info': 1,
    'warning': 2,
    'high': 3,
    'critical': 4
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // Enrich the log entry with metadata
    const enrichedEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      metadata: {
        requestId: this.generateRequestId(),
        ...entry.metadata
      }
    }

    // Add HIPAA compliance fields if dealing with medical data
    if (this.isMedicalEvent(entry.event)) {
      enrichedEntry.details = {
        ...enrichedEntry.details,
        hipaaCompliant: true,
        auditTrail: true,
        dataClassification: 'medical'
      }
    }

    // Sanitize sensitive information
    enrichedEntry.details = this.sanitizeLogData(enrichedEntry.details)

    // Add to queue for processing
    this.logQueue.push(enrichedEntry)

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processLogQueue()
    }

    // For critical events, also log immediately
    if (entry.severity === 'critical') {
      await this.logImmediate(enrichedEntry)
    }
  }

  /**
   * Process the log queue asynchronously
   */
  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.logQueue.length > 0) {
        const entry = this.logQueue.shift()
        if (entry) {
          await this.writeToDestinations(entry)
        }
      }
    } catch (error) {
      console.error('Error processing log queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Write log entry to all enabled destinations
   */
  private async writeToDestinations(entry: AuditLogEntry): Promise<void> {
    const promises = this.destinations
      .filter(dest => dest.enabled && this.shouldLogToDestination(entry.severity, dest.minSeverity))
      .map(dest => this.writeToDestination(dest.name, entry))

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Error writing to log destinations:', error)
    }
  }

  /**
   * Write to a specific destination
   */
  private async writeToDestination(destination: string, entry: AuditLogEntry): Promise<void> {
    switch (destination) {
      case 'console':
        this.writeToConsole(entry)
        break
      
      case 'file':
        await this.writeToFile(entry)
        break
      
      case 'database':
        await this.writeToDatabase(entry)
        break
      
      case 'siem':
        await this.writeToSIEM(entry)
        break
      
      default:
        console.warn(`Unknown log destination: ${destination}`)
    }
  }

  /**
   * Write to console with appropriate formatting
   */
  private writeToConsole(entry: AuditLogEntry): void {
    const logLevel = entry.severity === 'info' ? 'log' : 
                    entry.severity === 'warning' ? 'warn' : 'error'
    
    const logMessage = {
      timestamp: entry.timestamp,
      event: entry.event,
      severity: entry.severity,
      details: entry.details,
      metadata: entry.metadata
    }

    console[logLevel](`[AUDIT] ${entry.event}:`, logMessage)
  }

  /**
   * Write to file system (in production, this would use a proper file logging system)
   */
  private async writeToFile(entry: AuditLogEntry): Promise<void> {
    try {
      // In a real implementation, this would write to rotating log files
      // For now, we'll just simulate the file write
      const logLine = JSON.stringify({
        timestamp: entry.timestamp,
        severity: entry.severity,
        event: entry.event,
        details: entry.details,
        metadata: entry.metadata
      }) + '\n'

      // Simulate file write delay
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // In production: await fs.appendFile('/var/log/medverus/audit.log', logLine)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[FILE LOG] ${logLine.trim()}`)
      }
    } catch (error) {
      console.error('Failed to write to file log:', error)
    }
  }

  /**
   * Write to database for persistent storage
   */
  private async writeToDatabase(entry: AuditLogEntry): Promise<void> {
    try {
      // In a real implementation, this would use your database client
      const dbRecord = {
        id: crypto.randomUUID(),
        timestamp: entry.timestamp,
        event_type: entry.event,
        severity: entry.severity,
        details: JSON.stringify(entry.details),
        metadata: JSON.stringify(entry.metadata),
        created_at: new Date()
      }

      // Simulate database write
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // In production: await db.audit_logs.insert(dbRecord)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB LOG] ${entry.event} - ${entry.severity}`)
      }
    } catch (error) {
      console.error('Failed to write to database log:', error)
    }
  }

  /**
   * Write to SIEM system for security monitoring
   */
  private async writeToSIEM(entry: AuditLogEntry): Promise<void> {
    try {
      // Format for SIEM ingestion (e.g., Splunk, ELK Stack)
      const siemEvent = {
        '@timestamp': entry.timestamp,
        'event.type': entry.event,
        'event.severity': entry.severity,
        'event.category': this.categorizeEvent(entry.event),
        'source.ip': entry.details.ip,
        'user.id': entry.details.userId,
        'http.request.method': entry.details.method,
        'url.path': entry.details.pathname,
        'medverus.audit': entry.details,
        'tags': ['medverus', 'audit', 'hipaa']
      }

      // Simulate SIEM API call
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // In production: await siemClient.sendEvent(siemEvent)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SIEM] ${entry.event} - ${entry.severity}`)
      }
    } catch (error) {
      console.error('Failed to write to SIEM:', error)
    }
  }

  /**
   * Log critical events immediately
   */
  private async logImmediate(entry: AuditLogEntry): Promise<void> {
    // For critical events, bypass the queue and log immediately
    await this.writeToDestinations(entry)
    
    // Also trigger alerts for critical events
    if (entry.severity === 'critical') {
      await this.triggerAlert(entry)
    }
  }

  /**
   * Trigger alerts for critical events
   */
  private async triggerAlert(entry: AuditLogEntry): Promise<void> {
    try {
      // In a real implementation, this would send notifications
      // via email, Slack, PagerDuty, etc.
      const alertMessage = {
        title: `Critical Security Event: ${entry.event}`,
        description: `Severity: ${entry.severity}`,
        details: entry.details,
        timestamp: entry.timestamp
      }

      // Simulate alert sending
      await new Promise(resolve => setTimeout(resolve, 25))
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ALERT] ${alertMessage.title}`)
      }
    } catch (error) {
      console.error('Failed to trigger alert:', error)
    }
  }

  /**
   * Check if event is related to medical data
   */
  private isMedicalEvent(event: string): boolean {
    const medicalEvents = [
      'MEDICAL_QUERY',
      'FILE_UPLOAD',
      'PATIENT_DATA_ACCESS',
      'HIPAA_COMPLIANCE_VIOLATION',
      'MEDICAL_RECORD_ACCESS'
    ]
    
    return medicalEvents.some(medEvent => event.includes(medEvent))
  }

  /**
   * Sanitize sensitive information from log data
   */
  private sanitizeLogData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'social_security',
      'credit_card',
      'patient_id',
      'medical_record'
    ]

    const sanitized = { ...data }

    // Recursively sanitize object
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject)
      }

      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]'
        } else {
          result[key] = sanitizeObject(value)
        }
      }
      
      return result
    }

    return sanitizeObject(sanitized)
  }

  /**
   * Check if should log to destination based on severity
   */
  private shouldLogToDestination(entrySeverity: string, minSeverity: string): boolean {
    return this.severityLevels[entrySeverity as keyof typeof this.severityLevels] >= 
           this.severityLevels[minSeverity as keyof typeof this.severityLevels]
  }

  /**
   * Categorize event for SIEM systems
   */
  private categorizeEvent(event: string): string {
    if (event.includes('AUTH')) return 'authentication'
    if (event.includes('ACCESS')) return 'access'
    if (event.includes('RATE_LIMIT')) return 'network'
    if (event.includes('HIPAA')) return 'compliance'
    if (event.includes('ERROR')) return 'error'
    return 'security'
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get audit log statistics
   */
  getStats(): {
    queueSize: number
    isProcessing: boolean
    destinations: LogDestination[]
  } {
    return {
      queueSize: this.logQueue.length,
      isProcessing: this.isProcessing,
      destinations: this.destinations
    }
  }

  /**
   * Update destination configuration
   */
  updateDestination(name: string, config: Partial<LogDestination>): void {
    const destination = this.destinations.find(d => d.name === name)
    if (destination) {
      Object.assign(destination, config)
    }
  }
}