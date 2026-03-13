export class AccessControlLayer {
    async checkAccess(userId: string, resource: string): Promise<boolean> {
        return true;
    }
}
