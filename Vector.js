class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Add another vector to this one
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    // Subtract another vector from this one
    subtract(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    // Multiply by a scalar
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    // Divide by a scalar
    divide(scalar) {
        if (scalar === 0) return new Vector();
        return new Vector(this.x / scalar, this.y / scalar);
    }

    // Get the magnitude (length) of the vector
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Get the distance to another vector
    distanceTo(other) {
        return this.subtract(other).magnitude();
    }

    // Normalize the vector (make it length 1)
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector();
        return this.divide(mag);
    }

    // Get the dot product with another vector
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    // Get the cross product with another vector (z component only in 2D)
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

    // Create a copy of this vector
    clone() {
        return new Vector(this.x, this.y);
    }

    // Limit the vector's magnitude to a maximum value
    limit(max) {
        const mag = this.magnitude();
        if (mag > max) {
            return this.normalize().multiply(max);
        }
        return this.clone();
    }

    // Get the angle of this vector in radians
    angle() {
        return Math.atan2(this.y, this.x);
    }

    // Set the magnitude of this vector
    setMagnitude(mag) {
        return this.normalize().multiply(mag);
    }

    // Static method to create a vector from an angle and magnitude
    static fromAngle(angle, magnitude = 1) {
        return new Vector(
            magnitude * Math.cos(angle),
            magnitude * Math.sin(angle)
        );
    }

    // Static method to create a random vector
    static random() {
        const angle = Math.random() * Math.PI * 2;
        return Vector.fromAngle(angle);
    }
} 