using VoiceBridge.Core.Models;
using Xunit;

namespace VoiceBridge.Tests;

public class RingBufferTests
{
    [Fact]
    public void RingBuffer_WriteAndRead_ReturnsCorrectData()
    {
        // Arrange
        var ringBuffer = new RingBuffer(16);
        float[] input = [1.0f, 2.0f, 3.0f, 4.0f];
        float[] output = new float[4];

        // Act
        int written = ringBuffer.Write(input);
        int read = ringBuffer.Read(output);

        // Assert
        Assert.Equal(4, written);
        Assert.Equal(4, read);
        Assert.Equal(input, output);
    }

    [Fact]
    public void RingBuffer_WrapAround_HandlesCircularityCorrectly()
    {
        // Arrange
        var ringBuffer = new RingBuffer(8); // capacity 8, max write 7
        float[] chunk1 = [1.0f, 2.0f, 3.0f, 4.0f, 5.0f];
        float[] read1 = new float[5];

        ringBuffer.Write(chunk1);
        ringBuffer.Read(read1); // head=5, tail=5

        float[] chunk2 = [6.0f, 7.0f, 8.0f, 9.0f, 10.0f]; // Will wrap around index 8
        float[] read2 = new float[5];

        // Act
        int written = ringBuffer.Write(chunk2);
        int read = ringBuffer.Read(read2);

        // Assert
        Assert.Equal(5, written);
        Assert.Equal(5, read);
        Assert.Equal(chunk2, read2);
    }

    [Fact]
    public void RingBuffer_Clear_ResetsBuffer()
    {
        // Arrange
        var ringBuffer = new RingBuffer(16);
        float[] input = [1.0f, 2.0f, 3.0f, 4.0f];
        ringBuffer.Write(input);

        // Act
        ringBuffer.Clear();

        // Assert
        Assert.Equal(0, ringBuffer.AvailableRead);
    }
}
