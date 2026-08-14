namespace VoiceBridge.Core.Models;

/// <summary>
/// Single-Producer Single-Consumer (SPSC) Lock-Free Circular Buffer for low-latency audio streaming.
/// Zero heap allocations during Read/Write operations to guarantee sub-50ms real-time audio safety.
/// </summary>
public class RingBuffer
{
    private readonly float[] _buffer;
    private readonly int _capacity;
    private int _head; // Write index
    private int _tail; // Read index

    public int Capacity => _capacity;

    public RingBuffer(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity), "Capacity must be positive.");
        _capacity = capacity;
        _buffer = new float[capacity];
        _head = 0;
        _tail = 0;
    }

    /// <summary>
    /// Gets the number of available float samples ready for reading.
    /// </summary>
    public int AvailableRead
    {
        get
        {
            int head = Volatile.Read(ref _head);
            int tail = Volatile.Read(ref _tail);
            if (head >= tail)
                return head - tail;
            return _capacity - tail + head;
        }
    }

    /// <summary>
    /// Gets the remaining write capacity in float samples.
    /// </summary>
    public int AvailableWrite => _capacity - AvailableRead - 1;

    /// <summary>
    /// Writes a span of PCM float samples into the circular buffer.
    /// Returns the actual number of samples written. Lock-free.
    /// </summary>
    public int Write(ReadOnlySpan<float> source)
    {
        int available = AvailableWrite;
        int toWrite = Math.Min(source.Length, available);
        if (toWrite <= 0) return 0;

        int head = _head;
        int firstChunk = Math.Min(toWrite, _capacity - head);
        source.Slice(0, firstChunk).CopyTo(_buffer.AsSpan(head, firstChunk));

        int secondChunk = toWrite - firstChunk;
        if (secondChunk > 0)
        {
            source.Slice(firstChunk, secondChunk).CopyTo(_buffer.AsSpan(0, secondChunk));
        }

        Volatile.Write(ref _head, (head + toWrite) % _capacity);
        return toWrite;
    }

    /// <summary>
    /// Reads float PCM samples from the circular buffer into destination span.
    /// Returns the number of samples actually read. Lock-free.
    /// </summary>
    public int Read(Span<float> destination)
    {
        int available = AvailableRead;
        int toRead = Math.Min(destination.Length, available);
        if (toRead <= 0) return 0;

        int tail = _tail;
        int firstChunk = Math.Min(toRead, _capacity - tail);
        _buffer.AsSpan(tail, firstChunk).CopyTo(destination.Slice(0, firstChunk));

        int secondChunk = toRead - firstChunk;
        if (secondChunk > 0)
        {
            _buffer.AsSpan(0, secondChunk).CopyTo(destination.Slice(firstChunk, secondChunk));
        }

        Volatile.Write(ref _tail, (tail + toRead) % _capacity);
        return toRead;
    }

    /// <summary>
    /// Clears buffer contents and resets read/write pointers.
    /// </summary>
    public void Clear()
    {
        _head = 0;
        _tail = 0;
        Array.Clear(_buffer, 0, _buffer.Length);
    }
}
